export type Category = 'Alimentation' | 'Énergie' | 'Télécoms' | 'Santé' | 'Autre';

export function sortingAgent(merchantName: string, amount: number): Category {
    const normalizedName = merchantName.toLowerCase();

    if (
        normalizedName.includes('epicerie') ||
        normalizedName.includes('metro') ||
        normalizedName.includes('iga') ||
        normalizedName.includes('maxi') ||
        normalizedName.includes('super c') ||
        normalizedName.includes('provigo')
    ) {
        return 'Alimentation';
    }

    if (normalizedName.includes('hydro') || normalizedName.includes('energie')) {
        return 'Énergie';
    }

    if (
        normalizedName.includes('bell') ||
        normalizedName.includes('videotron') ||
        normalizedName.includes('rogers') ||
        normalizedName.includes('telus') ||
        normalizedName.includes('fido')
    ) {
        return 'Télécoms';
    }

    if (
        normalizedName.includes('pharmacie') ||
        normalizedName.includes('jean coutu') ||
        normalizedName.includes('uniprix') ||
        normalizedName.includes('familiprix')
    ) {
        return 'Santé';
    }

    return 'Autre';
}
