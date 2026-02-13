import { View, Text, TouchableOpacity, FlatList, ScrollView, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function Dashboard() {
    const colors = useColors();
    const router = useRouter();
    const [totalAmount, setTotalAmount] = useState(0);
    const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            // 1. Fetch sum of total_amount
            const { data: allReceipts, error: sumError } = await supabase
                .from('receipts')
                .select('total_amount');

            if (sumError) throw sumError;

            const sum = allReceipts?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
            setTotalAmount(sum);

            // 2. Fetch last 5 receipts
            const { data: last5, error: listError } = await supabase
                .from('receipts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (listError) throw listError;

            setRecentReceipts(last5 || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
    };

    return (
        <ScreenContainer className="p-6">
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, gap: 24 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header & Total */}
                <View className="gap-2 items-center mt-4">
                    <Text className="text-base text-muted uppercase tracking-wider font-medium">
                        Total Dépenses
                    </Text>
                    <Text className="text-5xl font-bold text-foreground">
                        {formatCurrency(totalAmount)}
                    </Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/scan')}
                    style={{
                        backgroundColor: colors.primary,
                        borderRadius: 16,
                        paddingVertical: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    <IconSymbol name="camera.fill" size={24} color="#FFFFFF" />
                    <Text className="text-lg font-bold text-white">Scanner un reçu</Text>
                </TouchableOpacity>

                {/* Recent Receipts List */}
                <View className="flex-1 gap-4">
                    <View className="flex-row justify-between items-end">
                        <Text className="text-xl font-bold text-foreground">Derniers reçus</Text>
                        <TouchableOpacity onPress={fetchData}>
                            <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {recentReceipts.length === 0 ? (
                        <View className="items-center justify-center p-8 bg-surface rounded-2xl border border-border">
                            <Text className="text-muted text-center">Aucun reçu scanné pour le moment</Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {recentReceipts.map((receipt) => (
                                <View
                                    key={receipt.id}
                                    style={{
                                        backgroundColor: colors.surface,
                                        borderRadius: 12,
                                        padding: 16,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <View className="gap-1 flex-1">
                                        <Text className="font-semibold text-foreground text-lg" numberOfLines={1}>
                                            {receipt.merchant_name || 'Marchand inconnu'}
                                        </Text>
                                        <View className="flex-row items-center gap-2">
                                            <Text className="text-xs text-muted bg-muted/10 px-2 py-1 rounded-md overflow-hidden">
                                                {receipt.category || 'Autre'}
                                            </Text>
                                            <Text className="text-xs text-muted">
                                                • {formatDate(receipt.created_at)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="font-bold text-foreground text-lg">
                                            {formatCurrency(receipt.total_amount)}
                                        </Text>
                                        {receipt.total_taxes > 0 && (
                                            <Text className="text-xs text-muted">
                                                Dont taxes: {formatCurrency(receipt.total_taxes)}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}
