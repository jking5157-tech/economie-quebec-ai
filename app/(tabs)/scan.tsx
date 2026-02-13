import { ScrollView, Text, View, TouchableOpacity, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { trpc } from "@/lib/trpc";
import { StorageService, type ScannedDocument as StoredDocument } from "@/lib/storage";
import { UploadService } from "@/lib/upload-service";
import { supabase } from "@/lib/supabase";
import { sortingAgent } from "@/lib/agent";

type DocumentType = "facture" | "releve-bancaire" | "carte-credit";



const DOCUMENT_TYPES: { type: DocumentType; label: string; icon: any }[] = [
  { type: "facture", label: "Facture", icon: "doc.text.viewfinder" },
  { type: "releve-bancaire", label: "Relevé bancaire", icon: "chart.bar.fill" },
  { type: "carte-credit", label: "Carte de crédit", icon: "dollarsign.circle.fill" },
];

export default function ScanScreen() {
  const colors = useColors();
  const [selectedType, setSelectedType] = useState<DocumentType>("facture");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<StoredDocument[]>([]);
  const analyzeMutation = trpc.ai.analyzeDocument.useMutation();
  const uploadMutation = trpc.upload.uploadImage.useMutation();
  const submitDataMutation = trpc.rewards.submitData.useMutation();

  useEffect(() => {
    loadDocuments();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        "Permissions requises",
        "L'application a besoin d'accéder à votre caméra et à votre galerie pour scanner des documents. Veuillez les activer dans les réglages de votre appareil.",
        [{ text: "OK" }]
      );
    }
  };

  const loadDocuments = async () => {
    const docs = await StorageService.getDocuments();
    setRecentDocuments(docs);
  };

  const handleCameraCapture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await analyzeDocument(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("Échec de la capture photo. Veuillez réessayer.");
    }
  };

  const handleGalleryUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await analyzeDocument(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Erreur lors de la sélection de l'image");
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await analyzeDocument(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking file:", error);
      alert(`Erreur lors de la sélection du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const analyzeDocument = async (imageUri: string) => {
    setIsProcessing(true);

    try {
      const newDoc: StoredDocument = {
        id: Date.now().toString(),
        type: selectedType,
        date: new Date().toISOString().split('T')[0],
        status: "en cours",
        imageUri,
      };

      await StorageService.addDocument(newDoc);
      await loadDocuments();

      // Upload de l'image vers S3
      const base64Data = await UploadService.imageToBase64(imageUri);
      const contentType = UploadService.getContentType(imageUri);

      const uploadResult = await uploadMutation.mutateAsync({
        base64Data,
        contentType,
        fileName: `document-${selectedType}-${Date.now()}.jpg`,
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      const imageUrl = uploadResult.url;

      const result = await analyzeMutation.mutateAsync({
        imageUrl: imageUrl,
        documentType: selectedType,
      });

      if (result.success) {
        // Gestion des alertes de crédit (taux, retards)
        // Note: L'alerte est gérée dans l'onglet Économies (savings.tsx)

        const documents = await StorageService.getDocuments();
        const updated = documents.map(d =>
          d.id === newDoc.id
            ? { ...d, status: "analysé" as const, extractedData: result.extractedData }
            : d
        );
        await StorageService.saveDocuments(updated);

        if (result.suggestions && result.suggestions.length > 0) {
          const suggestions = await StorageService.getSuggestions();
          const newSuggestions = result.suggestions.map((s: any, i: number) => ({
            id: `${Date.now()}-${i}`,
            category: s.category || s.type || 'autre', // Fallback if prompt uses 'type'
            title: s.title,
            description: s.description,
            savings: s.savings || s.potentialSavings || 0, // Handle both field names
            status: "active" as const,
            createdAt: new Date().toISOString(),
          }));
          await StorageService.saveSuggestions([...newSuggestions, ...suggestions]);
        }

        if (result.extractedData) {
          const { metadata, transaction, category, inventory } = result.extractedData;
          const merchantName = metadata?.merchant_name;
          const city = metadata?.city || 'Inconnu';
          const totalAmount = transaction?.total_amount;

          const finalCategory = category || sortingAgent(merchantName || 'Inconnu', totalAmount || 0);

          // 1. Sauvegarde personnelle (Supabase)
          const { error } = await supabase.from('receipts').insert({
            merchant_name: merchantName,
            total_amount: totalAmount,
            total_taxes: 0,
            category: finalCategory
          });

          if (error) {
            console.error("Erreur Supabase:", error);
            alert("Erreur lors de l'envoi vers Supabase: " + error.message);
          } else {
            console.log("Facture envoyée ! Profit net calculé.");

            // 2. Sauvegarde anonyme (Loi 25 - Récompenses)
            try {
              await submitDataMutation.mutateAsync({
                amount: String(totalAmount || 0),
                category: finalCategory,
                city: city,
                inventory: inventory || []
              });
              console.log("Données anonymisées envoyées pour récompenses.");
            } catch (err) {
              console.warn("Erreur envoi données anonymes:", err);
            }

            alert("Facture envoyée ! Profit net calculé.");
          }
        }

        await loadDocuments();
        alert(`Analyse terminée! ${result.suggestions?.length || 0} suggestions générées. Consultez l'onglet Économies.`);
      } else {
        throw new Error(result.error || "Erreur d'analyse");
      }
    } catch (error) {
      console.error("Error analyzing document:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";

      // Détecter les erreurs de parsing JSON (problème backend)
      if (errorMessage.toLowerCase().includes("json parse")) {
        alert("Le serveur n'a pas répondu correctement. Vérifiez les logs du backend (API Key manquante ?).");
      } else {
        alert(`Erreur lors de l'analyse du document: ${errorMessage}`);
      }

      // Mettre à jour le statut du document en erreur
      const documents = await StorageService.getDocuments();
      const updated = documents.map(d =>
        d.imageUri === imageUri && d.status === "en cours"
          ? { ...d, status: "erreur" as const }
          : d
      );
      await StorageService.saveDocuments(updated);
      await loadDocuments();
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "analysé":
        return colors.success;
      case "en cours":
        return colors.warning;
      case "erreur":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    return DOCUMENT_TYPES.find((t) => t.type === type)?.label || type;
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* En-tête */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Analyser un document</Text>
            <Text className="text-base text-muted">
              Scannez vos factures et relevés pour identifier des économies potentielles
            </Text>
          </View>

          {/* Sélection du type de document */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Type de document</Text>
            <View className="flex-row gap-2">
              {DOCUMENT_TYPES.map((docType) => (
                <TouchableOpacity
                  key={docType.type}
                  onPress={() => setSelectedType(docType.type)}
                  style={{
                    backgroundColor: selectedType === docType.type ? colors.primary : colors.surface,
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <IconSymbol
                    name={docType.icon}
                    size={24}
                    color={selectedType === docType.type ? "#FFFFFF" : colors.foreground}
                  />
                  <Text
                    className="text-xs font-medium mt-1"
                    style={{
                      color: selectedType === docType.type ? "#FFFFFF" : colors.foreground,
                    }}
                  >
                    {docType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Boutons d'action */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleCameraCapture}
              disabled={isProcessing}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: isProcessing ? 0.6 : 1,
              }}
            >
              <IconSymbol name="camera.fill" size={24} color="#FFFFFF" />
              <Text className="text-lg font-semibold text-white">
                {isProcessing ? "Analyse en cours..." : "Prendre une photo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGalleryUpload}
              disabled={isProcessing}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: isProcessing ? 0.6 : 1,
              }}
            >
              <IconSymbol name="photo.fill" size={24} color={colors.foreground} />
              <Text className="text-lg font-semibold text-foreground">Choisir de la galerie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFileUpload}
              disabled={isProcessing}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: isProcessing ? 0.6 : 1,
              }}
            >
              <IconSymbol name="doc.fill" size={24} color={colors.foreground} />
              <Text className="text-lg font-semibold text-foreground">Importer un fichier</Text>
            </TouchableOpacity>
          </View>

          {/* Historique des documents */}
          <View className="gap-3 flex-1">
            <Text className="text-sm font-semibold text-foreground">Documents récents</Text>
            <FlatList
              data={recentDocuments}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Text className="text-base font-semibold text-foreground">
                        {getDocumentTypeLabel(item.type)}
                      </Text>
                      <Text className="text-sm text-muted">{item.date}</Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: getStatusColor(item.status) + "20",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: getStatusColor(item.status) }}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
