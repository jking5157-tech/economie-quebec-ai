import * as dotenv from "dotenv";
dotenv.config();

async function run() {
    const key = process.env.GEMINI_API_KEY;
    console.log("🔍 Interrogation directe de Google...");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("✅ VOICI LA LISTE DES MODÈLES DISPONIBLES POUR TOI :");
            console.log("------------------------------------------------");
            data.models.forEach((m: any) => {
                // On affiche seulement ceux qui peuvent générer du contenu
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`👉 ${m.name}`);
                }
            });
            console.log("------------------------------------------------");
        } else {
            console.log("❌ Erreur Google :", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("🔥 Erreur réseau :", error);
    }
}
run();
