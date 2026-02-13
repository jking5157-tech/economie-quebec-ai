import { ScrollView, Text, View, TouchableOpacity, TextInput, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useRef, useEffect } from "react";
import { Alert } from "react-native";
import { StorageService, type ChatMessage } from "@/lib/storage";
import { trpc } from "@/lib/trpc";
import * as ImagePicker from "expo-image-picker";
import { UploadService } from "@/lib/upload-service";



const QUICK_QUESTIONS = [
  "Comment économiser sur mes impôts?",
  "Trouve-moi un meilleur forfait cellulaire",
  "Analyse mes dépenses du mois",
  "Quels crédits d'impôt puis-je réclamer?",
];

const VOICE_COMMANDS = [
  "Réduis mon objectif de 5%",
  "Augmente mon objectif de 5%",
  "Mets mon objectif à 15%",
  "Analyse cette facture",
];

export default function AssistantScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'historique du chat
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    setIsLoading(true);
    let history = await StorageService.getChatHistory();
    
    // Si vide, ajouter le message de bienvenue
    if (history.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "1",
        role: "assistant",
        content:
          "Bonjour! Je suis votre assistant financier AI. Je peux vous aider à analyser vos dépenses, trouver des économies et optimiser votre budget. Comment puis-je vous aider aujourd'hui?",
        timestamp: new Date(),
      };
      await StorageService.addChatMessage(welcomeMessage);
      history = [welcomeMessage];
    }
    
    setMessages(history);
    setIsLoading(false);
  };
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const chatMutation = trpc.ai.chat.useMutation();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // Message utilisateur avec indication d'image
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: "[Image envoyée] Peux-tu analyser cette facture et la classer?",
        timestamp: new Date(),
      };
      await StorageService.addChatMessage(userMessage);
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Upload l'image vers S3
        const imageUrl = await UploadService.uploadImage(imageUri);

        // Appel à l'API AI avec l'image
        const result = await chatMutation.mutateAsync({
          message: `Analyse cette facture (image: ${imageUrl}) et extrait les informations importantes (montant, catégorie, date, fournisseur). Classe-la automatiquement dans la bonne catégorie.`,
          context: {},
        });

        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: typeof result.content === 'string' ? result.content : JSON.stringify(result.content),
          timestamp: new Date(),
        };
        await StorageService.addChatMessage(aiResponse);
        setMessages((prev) => [...prev, aiResponse]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      } catch (error) {
        console.error("Error uploading image:", error);
        Alert.alert("Erreur", "Impossible d'analyser l'image");
      }
    }
  };

  const executeCommand = async (command: string) => {
    const prefs = await StorageService.getPreferences();
    let newGoal = prefs.savingsGoal;
    let actionDescription = "";

    if (command.includes("Réduis") && command.includes("5%")) {
      newGoal = Math.max(0.05, prefs.savingsGoal - 0.05);
      actionDescription = `Objectif réduit de 5% : ${(newGoal * 100).toFixed(0)}%`;
    } else if (command.includes("Augmente") && command.includes("5%")) {
      newGoal = Math.min(0.25, prefs.savingsGoal + 0.05);
      actionDescription = `Objectif augmenté de 5% : ${(newGoal * 100).toFixed(0)}%`;
    } else if (command.includes("Mets") && command.includes("15%")) {
      newGoal = 0.15;
      actionDescription = "Objectif défini à 15%";
    }

    if (actionDescription) {
      await StorageService.savePreferences({
        ...prefs,
        savingsGoal: newGoal,
      });

      const aiResponse: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `✅ ${actionDescription}. Votre nouvel objectif mensuel est de ${((prefs.monthlyIncome * newGoal)).toFixed(0)} $ (${(newGoal * 100).toFixed(0)}% de votre revenu de ${prefs.monthlyIncome} $).`,
        timestamp: new Date(),
      };
      await StorageService.addChatMessage(aiResponse);
      setMessages((prev) => [...prev, aiResponse]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === "") return;

    // Vérifier si c'est une commande vocale
    const isCommand = VOICE_COMMANDS.some((cmd: string) => 
      inputText.toLowerCase().includes(cmd.toLowerCase().substring(0, 10))
    );

    if (isCommand) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: inputText,
        timestamp: new Date(),
      };
      await StorageService.addChatMessage(userMessage);
      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      
      await executeCommand(inputText);
      return;
    }
    if (inputText.trim() === "") return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    await StorageService.addChatMessage(userMessage);
    setMessages((prev) => [...prev, userMessage]);
    const question = inputText;
    setInputText("");

    // Appel à l'API AI réelle
    try {
      const prefs = await StorageService.getPreferences();
      const result = await chatMutation.mutateAsync({
        message: question,
        context: {
          monthlyIncome: prefs.monthlyIncome,
          currentSavings: await StorageService.getTotalSavings(),
        },
      });

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: typeof result.content === 'string' ? result.content : JSON.stringify(result.content),
        timestamp: new Date(),
      };
      await StorageService.addChatMessage(aiResponse);
      setMessages((prev) => [...prev, aiResponse]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error("Error calling AI:", error);
      // Fallback en cas d'erreur
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Désolé, je rencontre un problème technique. Veuillez réessayer.",
        timestamp: new Date(),
      };
      await StorageService.addChatMessage(aiResponse);
      setMessages((prev) => [...prev, aiResponse]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  const getAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("impôt") || lowerQuestion.includes("impot")) {
      return "Pour économiser sur vos impôts au Québec, voici quelques suggestions:\n\n1. Réclamez le crédit d'impôt pour transport en commun\n2. Déduisez vos frais de télétravail\n3. Cotisez à votre REER avant la date limite\n4. Réclamez les frais médicaux admissibles\n\nJ'ai analysé vos documents et identifié 180$ d'économies potentielles en crédits d'impôt non réclamés. Consultez l'onglet Économies pour plus de détails.";
    }

    if (lowerQuestion.includes("cellulaire") || lowerQuestion.includes("forfait")) {
      return "J'ai comparé votre forfait actuel avec les offres disponibles au Québec. Voici ce que j'ai trouvé:\n\n📱 Votre forfait actuel: Vidéotron - 85$/mois\n✅ Meilleure option: Fizz - 50$/mois (même couverture)\n💰 Économie: 35$/mois (420$/an)\n\nVoulez-vous que je vous aide à effectuer le changement?";
    }

    if (lowerQuestion.includes("dépense") || lowerQuestion.includes("depense") || lowerQuestion.includes("analyse")) {
      return "Voici un résumé de vos dépenses ce mois-ci:\n\n🏠 Logement: 1200$ (34%)\n🛒 Épicerie: 450$ (13%)\n🚗 Transport: 280$ (8%)\n📱 Cellulaire: 85$ (2%)\n🎬 Divertissement: 150$ (4%)\n\nTotal dépensé: 2260$\nBudget restant: 100$\n\nJ'ai identifié 3 catégories où vous pourriez économiser. Consultez l'onglet Économies pour voir mes suggestions.";
    }

    return "Je comprends votre question. Basé sur l'analyse de vos finances, je peux vous aider à:\n\n• Identifier des économies potentielles\n• Optimiser votre budget mensuel\n• Trouver des crédits d'impôt\n• Comparer les prix des services\n\nPouvez-vous préciser ce que vous aimeriez savoir?";
  };

  return (
    <ScreenContainer className="p-0" edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* En-tête */}
        <View className="px-6 pt-4 pb-3" style={{ backgroundColor: colors.background }}>
          <Text className="text-3xl font-bold text-foreground">Assistant AI</Text>
          <Text className="text-sm text-muted">Votre conseiller financier personnel</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6"
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={{
                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: message.role === "user" ? colors.primary : colors.surface,
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: message.role === "assistant" ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-sm leading-relaxed"
                  style={{
                    color: message.role === "user" ? "#FFFFFF" : colors.foreground,
                  }}
                >
                  {message.content}
                </Text>
              </View>
              <Text
                className="text-xs text-muted mt-1"
                style={{
                  textAlign: message.role === "user" ? "right" : "left",
                }}
              >
                {message.timestamp.toLocaleTimeString("fr-CA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Questions rapides */}
        {messages.length === 1 && (
          <View className="px-6 pb-3">
            <Text className="text-xs font-semibold text-muted mb-2">Questions rapides</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {QUICK_QUESTIONS.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleQuickQuestion(question)}
                    style={{
                      backgroundColor: colors.surface,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text className="text-xs text-foreground">{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Zone de saisie */}
        <View
          className="px-6 pb-6 pt-3"
          style={{
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handlePickImage}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <IconSymbol name="photo.fill" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Posez votre question..."
              placeholderTextColor={colors.muted}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 14,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={inputText.trim() === ""}
              style={{
                backgroundColor: inputText.trim() === "" ? colors.surface : colors.primary,
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol
                name="paperplane.fill"
                size={20}
                color={inputText.trim() === "" ? colors.muted : "#FFFFFF"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
