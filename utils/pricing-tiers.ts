export const PRICING_TIERS = [
    {
        name: 'Essential',
        price: 150,
        rank: 1,
        description: 'Standard Filing (Employment/Interest)',
        features: ['Standard Slips (T4, T5, T4A)'],
        upgradeHeadline: '',
        upgradeFeatures: []
    },
    {
        name: 'Plus',
        price: 250,
        rank: 2,
        description: 'Intermediate Filing (Capital Gains)',
        features: [
            'Audit Protection',
            'Priority Queueing'
        ],
        upgradeHeadline: '',
        upgradeFeatures: [
            'Adds Priority Queueing: Your return moves to the front of the line',
            'Adds Audit Protection: Professional support for CRA inquiries'
        ]
    },
    {
        name: 'Pro',
        price: 350,
        rank: 3,
        description: 'Complex Filing (Business/Rental)',
        features: [
            'Audit Protection',
            'Expert Strategy Review',
            'Full Audit Defense',
            'Year-Round Consultation',
            'Priority Support'
        ],
        upgradeHeadline: '',
        upgradeFeatures: [
            'Adds Expert Strategy Review: A senior CPA reviews every line',
            'Adds Full Audit Defense: We represent you to the CRA for 7 years on this filing',
            'Adds Year-Round Consultation: Expert advice whenever you need it'
        ]
    }
];

export function getTier(name: string) {
    return PRICING_TIERS.find(t => t.name.toLowerCase() === name.toLowerCase()) || PRICING_TIERS[0];
}
