import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export interface MonthlyReportData {
  month: string;
  year: number;
  totalSaved: number;
  savingsGoal: number;
  percentageAchieved: number;
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  suggestions: Array<{
    title: string;
    category: string;
    savings: number;
    status: string;
  }>;
}

export interface AnnualReportData {
  year: number;
  totalSaved: number;
  totalIncome: number;
  savingsRate: number;
  monthlyData: Array<{
    month: string;
    saved: number;
    spent: number;
  }>;
  topCategories: Array<{
    name: string;
    total: number;
  }>;
  suggestionsApplied: number;
}

export class PDFExportService {
  /**
   * Générer un rapport mensuel en PDF
   */
  static async generateMonthlyReport(data: MonthlyReportData): Promise<void> {
    const html = this.generateMonthlyHTML(data);

    try {
      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === "web") {
        // Sur web, télécharger directement
        const link = document.createElement("a");
        link.href = uri;
        link.download = `rapport-mensuel-${data.month}-${data.year}.pdf`;
        link.click();
      } else {
        // Sur mobile, partager le PDF
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: `Rapport mensuel - ${data.month} ${data.year}`,
            UTI: "com.adobe.pdf",
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      throw error;
    }
  }

  /**
   * Générer un rapport annuel en PDF
   */
  static async generateAnnualReport(data: AnnualReportData): Promise<void> {
    const html = this.generateAnnualHTML(data);

    try {
      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = uri;
        link.download = `rapport-annuel-${data.year}.pdf`;
        link.click();
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: `Rapport annuel ${data.year}`,
            UTI: "com.adobe.pdf",
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      throw error;
    }
  }

  /**
   * Générer le HTML pour le rapport mensuel
   */
  private static generateMonthlyHTML(data: MonthlyReportData): string {
    const categoriesHTML = data.categories
      .map(
        (cat) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${cat.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">${cat.amount} $</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">${cat.percentage}%</td>
        </tr>
      `
      )
      .join("");

    const suggestionsHTML = data.suggestions
      .map(
        (sug) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${sug.title}</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${sug.category}</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #22C55E; font-weight: 600;">${sug.savings} $</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
            <span style="background-color: ${sug.status === "Appliquée" ? "#22C55E20" : "#F59E0B20"}; 
                         color: ${sug.status === "Appliquée" ? "#22C55E" : "#F59E0B"}; 
                         padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${sug.status}
            </span>
          </td>
        </tr>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport Mensuel - ${data.month} ${data.year}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 40px;
              color: #11181C;
            }
            h1 {
              color: #0066CC;
              font-size: 32px;
              margin-bottom: 8px;
            }
            h2 {
              color: #11181C;
              font-size: 20px;
              margin-top: 32px;
              margin-bottom: 16px;
            }
            .subtitle {
              color: #687076;
              font-size: 14px;
              margin-bottom: 32px;
            }
            .summary-card {
              background-color: #0066CC;
              color: white;
              padding: 24px;
              border-radius: 12px;
              margin-bottom: 32px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 16px;
            }
            .summary-label {
              font-size: 14px;
              opacity: 0.9;
            }
            .summary-value {
              font-size: 28px;
              font-weight: bold;
            }
            .progress-bar {
              height: 8px;
              background-color: rgba(255, 255, 255, 0.3);
              border-radius: 4px;
              margin-top: 16px;
              overflow: hidden;
            }
            .progress-fill {
              height: 100%;
              background-color: white;
              width: ${data.percentageAchieved}%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            th {
              background-color: #F5F5F5;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
            }
            td {
              font-size: 14px;
            }
            .footer {
              margin-top: 48px;
              padding-top: 24px;
              border-top: 2px solid #E5E7EB;
              text-align: center;
              color: #687076;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Rapport Mensuel</h1>
          <p class="subtitle">${data.month} ${data.year} • Généré le ${new Date().toLocaleDateString("fr-CA")}</p>

          <div class="summary-card">
            <div class="summary-row">
              <div>
                <div class="summary-label">Économies réalisées</div>
                <div class="summary-value">${data.totalSaved} $</div>
              </div>
              <div style="text-align: right;">
                <div class="summary-label">Objectif</div>
                <div class="summary-value">${data.savingsGoal} $</div>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p style="margin-top: 8px; font-size: 14px; opacity: 0.9;">
              ${data.percentageAchieved}% de votre objectif atteint
            </p>
          </div>

          <h2>Répartition des dépenses</h2>
          <table>
            <thead>
              <tr>
                <th>Catégorie</th>
                <th style="text-align: right;">Montant</th>
                <th style="text-align: right;">Pourcentage</th>
              </tr>
            </thead>
            <tbody>
              ${categoriesHTML}
            </tbody>
          </table>

          <h2>Suggestions d'économies</h2>
          <table>
            <thead>
              <tr>
                <th>Suggestion</th>
                <th>Catégorie</th>
                <th style="text-align: right;">Économie</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${suggestionsHTML}
            </tbody>
          </table>

          <div class="footer">
            <p>Rapport généré par Économie Québec</p>
            <p>Application d'agent AI pour la gestion financière</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Générer le HTML pour le rapport annuel
   */
  private static generateAnnualHTML(data: AnnualReportData): string {
    const monthlyDataHTML = data.monthlyData
      .map(
        (month) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${month.month}</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #22C55E; font-weight: 600;">${month.saved} $</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">${month.spent} $</td>
        </tr>
      `
      )
      .join("");

    const topCategoriesHTML = data.topCategories
      .map(
        (cat) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${cat.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right; font-weight: 600;">${cat.total} $</td>
        </tr>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport Annuel ${data.year}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 40px;
              color: #11181C;
            }
            h1 {
              color: #0066CC;
              font-size: 32px;
              margin-bottom: 8px;
            }
            h2 {
              color: #11181C;
              font-size: 20px;
              margin-top: 32px;
              margin-bottom: 16px;
            }
            .subtitle {
              color: #687076;
              font-size: 14px;
              margin-bottom: 32px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin-bottom: 32px;
            }
            .stat-card {
              background-color: #F5F5F5;
              padding: 20px;
              border-radius: 12px;
            }
            .stat-label {
              font-size: 14px;
              color: #687076;
              margin-bottom: 8px;
            }
            .stat-value {
              font-size: 28px;
              font-weight: bold;
              color: #0066CC;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            th {
              background-color: #F5F5F5;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
            }
            td {
              font-size: 14px;
            }
            .footer {
              margin-top: 48px;
              padding-top: 24px;
              border-top: 2px solid #E5E7EB;
              text-align: center;
              color: #687076;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Rapport Annuel ${data.year}</h1>
          <p class="subtitle">Résumé de votre année financière • Généré le ${new Date().toLocaleDateString("fr-CA")}</p>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total économisé</div>
              <div class="stat-value">${data.totalSaved} $</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Taux d'épargne</div>
              <div class="stat-value">${data.savingsRate}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Suggestions appliquées</div>
              <div class="stat-value">${data.suggestionsApplied}</div>
            </div>
          </div>

          <h2>Évolution mensuelle</h2>
          <table>
            <thead>
              <tr>
                <th>Mois</th>
                <th style="text-align: right;">Économies</th>
                <th style="text-align: right;">Dépenses</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyDataHTML}
            </tbody>
          </table>

          <h2>Catégories principales</h2>
          <table>
            <thead>
              <tr>
                <th>Catégorie</th>
                <th style="text-align: right;">Total annuel</th>
              </tr>
            </thead>
            <tbody>
              ${topCategoriesHTML}
            </tbody>
          </table>

          <div class="footer">
            <p>Rapport généré par Économie Québec</p>
            <p>Application d'agent AI pour la gestion financière</p>
          </div>
        </body>
      </html>
    `;
  }
}
