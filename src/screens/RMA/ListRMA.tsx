import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Modal,
    ScrollView,
    useWindowDimensions
} from "react-native";
import { useSelector } from "react-redux";
import { StackScreenProps } from "@react-navigation/stack";
import { t } from "i18next";

import { RMA } from "@/api/rmaApi";
import { useCancelRma, useCustomerRMA } from "@/hooks/rmaHooks";
import { RootStackParamList } from "@/navigation/RootStackParamList";
import { RootState } from "@/redux/store";
import Header from "@/layout/Header";
import { formatDate } from "@/utils/helpers";
import { COLORS, FONTS } from "@/constants/theme";
import { GlobalStyleSheet } from "@/constants/StyleSheet";
import { Feather } from "@expo/vector-icons";

type ListRMAScreenProps = StackScreenProps<RootStackParamList, 'ListRMA'>;

const ListRMA = ({ navigation }: ListRMAScreenProps) => {
    const { userToken, user } = useSelector((state: RootState) => state.auth);
    const { rmas, isLoading, error, refetch } = useCustomerRMA(user?.id.toString());
    const dimensions =useWindowDimensions()


    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [showFilterModal, setShowFilterModal] = useState(false);

    const { cancelRma, isLoading: isCancelling } = useCancelRma();

    // Add this handler
    const handleCancelRMA = async (rmaId: string) => {
        Alert.alert(
            t("cancel"),
            t("cancel_rma_confirmation"),
            [
                {
                    text: t("cancel"),
                    style: "cancel"
                },
                {
                    text: t("confirm"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await cancelRma(rmaId);
                            refetch?.();
                        } catch (error) {
                            Alert.alert(t("error"), t("cancel_rma_error"));
                        }
                    }
                }
            ]
        );
    };

    // Check if RMA can be cancelled
    const canCancelRMA = (status: string) => {
        return status !== 'Annulée' && status !== 'Résolu';
    };

    // Get unique statuses for filter options
    const availableStatuses = useMemo(() => {
        const statuses = rmas?.map(rma => rma.rmaStatus) || [];
        return ['all', ...Array.from(new Set(statuses))];
    }, [rmas]);

    // Filter and sort RMAs
    const filteredAndSortedRMAs = useMemo(() => {
        if (!rmas) return [];

        // Filter by status
        let filtered = selectedStatus === 'all'
            ? rmas
            : rmas.filter(rma => rma.rmaStatus === selectedStatus);

        // Sort by date
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdDate).getTime();
            const dateB = new Date(b.createdDate).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [rmas, selectedStatus, sortOrder]);

    const handleCreateRMA = () => {
        refetch()

    };

    // Get status color based on RMA status
    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'En attente':
                return '#FF9500';
            case 'Declined':
                return '#FF3B30';
            case 'Annulée':
                return 'red';
            case 'En cours de traitement':
                return '#007AFF';
            case 'Résolu':
                return '#34C759';
            default:
                return '#8E8E93';
        }
    };

    const handleViewDetails = (rma: RMA) => {
        navigation.navigate('RMADetails', { rmaId: rma.id });
    };

    const handleRefresh = () => {
        refetch?.();
    };

    const resetFilters = () => {
        setSelectedStatus('all');
        setSortOrder('newest');
        setShowFilterModal(false);
    };

    const renderFilterModal = () => (
        <Modal
            visible={showFilterModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowFilterModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{t("filter_and_sort")}</Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                            <Text style={styles.modalCloseButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {/* Status Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>{t("filter_by_status")}</Text>
                            {availableStatuses.map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.filterOption,
                                        selectedStatus === status && styles.filterOptionSelected
                                    ]}
                                    onPress={() => setSelectedStatus(status)}
                                >
                                    <Text style={[
                                        styles.filterOptionText,
                                        selectedStatus === status && styles.filterOptionTextSelected
                                    ]}>
                                        {status === 'all' ? t("all") : status.toUpperCase()}
                                    </Text>
                                    {selectedStatus === status && (
                                        <Text style={styles.filterOptionCheck}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Sort Options */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>{t("sort_by_date")}</Text>
                            {['newest', 'oldest'].map((order) => (
                                <TouchableOpacity
                                    key={order}
                                    style={[
                                        styles.filterOption,
                                        sortOrder === order && styles.filterOptionSelected
                                    ]}
                                    onPress={() => setSortOrder(order as 'newest' | 'oldest')}
                                >
                                    <Text style={[
                                        styles.filterOptionText,
                                        sortOrder === order && styles.filterOptionTextSelected
                                    ]}>
                                        {order === 'newest' ? t("newest_first") : t("oldest_first")}
                                    </Text>
                                    {sortOrder === order && (
                                        <Text style={styles.filterOptionCheck}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={resetFilters}
                        >
                            <Text style={styles.resetButtonText}>{t("reset")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => setShowFilterModal(false)}
                        >
                            <Text style={styles.applyButtonText}>{t("apply")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

const renderEmptyState = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: dimensions.height/4+20 }}>
    <View
      style={{
        height: 60,
        width: 60,
        borderRadius: 30,           // half of width/height
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryLight,
        marginBottom: 20,
      }}
    >
      <Feather color={COLORS.primary} size={24} name="archive" />
    </View>
    <Text style={{ ...FONTS.h5, color: COLORS.title, marginBottom: 8 }}>
      {t('noRMAsFound')}
    </Text>
    <Text
      style={{
        ...FONTS.fontSm,
        color: COLORS.text,
        textAlign: 'center',
        paddingHorizontal: 40,
      }}
    >
      {t('noRMAsDescription')}
    </Text>
  </View>
)

    //      (
    //     <View style={styles.emptyState}>
    //         <Text style={styles.emptyStateTitle}>{t("noRMAsFound")}</Text>
    //         <Text style={styles.emptyStateText}>{t("noRMAsDescription")}</Text>
    //     </View>
    // );

    const renderError = () => (
        <View style={styles.errorState}>
            <Text style={styles.errorTitle}>{t("errorLoadingRMAs")}</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>{t("retry")}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderRMAItem = ({ item }: { item: RMA }) => (
        <TouchableOpacity
            style={styles.rmaCard}
            onPress={() => handleViewDetails(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.rmaIdContainer}>
                    <Text style={styles.rmaIdLabel}>{t("rmaId")}</Text>
                    <Text style={styles.rmaIdValue}>#{item.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.rmaStatus) }]}>
                    <Text style={styles.statusText}>{item.rmaStatus.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t("order")}:</Text>
                    <Text style={styles.infoValue}>{item.orderRef}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t("dateCreated")}:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.createdDate)}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.viewButton, { flex: 1, marginRight: 8 }]}
                        onPress={() => handleViewDetails(item)}
                    >
                        <Text style={styles.viewButtonText}>{t("view_details")}</Text>
                    </TouchableOpacity>

                    {canCancelRMA(item.rmaStatus) && (
                        <TouchableOpacity
                            style={[styles.cancelButton, { flex: 1, marginLeft: 8 }]}
                            onPress={() => handleCancelRMA(item.id)}
                            disabled={isCancelling}
                        >
                            <Text style={styles.cancelButtonText}>
                                {isCancelling ? t("cancelling") : t("cancel")}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (error) {
        return (
            <View style={styles.container}>
                {renderError()}
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <Header
                title={filteredAndSortedRMAs?.length ? t("rmaCount", { count: filteredAndSortedRMAs.length }) : ""}
                leftIcon='back'
                titleLeft


            />

            {/* Floating Action Button */}


            {/* Filter Bar */}
            <View style={styles.filterBar}>
                <View style={styles.filterInfo}>
                    <Text style={styles.filterInfoText}>
                        {selectedStatus !== 'all' && `${t("status")}: ${selectedStatus.toUpperCase()} • `}
                        {t("sortedBy")}: {sortOrder === 'newest' ? t("newest") : t("oldest")}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilterModal(true)}
                >
                    <Text style={styles.filterButtonText}>⚙️ {t("filter")}</Text>
                </TouchableOpacity>
                {/*  */}
            </View>

            <FlatList
                data={filteredAndSortedRMAs}
                renderItem={renderRMAItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={handleRefresh}
                        colors={['#007AFF']}
                        tintColor="#007AFF"
                    />
                }
                ListEmptyComponent={!isLoading ? renderEmptyState : null}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {renderFilterModal()}

            {isLoading && !filteredAndSortedRMAs?.length && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>{t("loadingRMAs")}</Text>
                </View>
            )}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    navigation.navigate('CreateRMA', {
                        onSuccessfullCreate: handleCreateRMA,
                    })
                }}
                activeOpacity={0.8}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    rmaCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    rmaIdContainer: {
        flex: 1,
    },
    rmaIdLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 2,
    },
    rmaIdValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    cardContent: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: '#1C1C1E',
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 12,
    },
    viewButton: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    viewButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    separator: {
        height: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
    },
    errorState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FF3B30',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(248, 249, 250, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8E8E93',
        fontWeight: '500',
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    filterInfo: {
        flex: 1,
    },
    filterInfoText: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
    filterButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    filterButtonText: {
        fontSize: 14,
        color: COLORS.light,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    modalCloseButton: {
        fontSize: 18,
        color: '#8E8E93',
        fontWeight: '600',
    },
    modalBody: {
        padding: 20,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 12,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4,
    },
    filterOptionSelected: {
        backgroundColor: COLORS.secondaryLight,
    },
    filterOptionText: {
        fontSize: 16,
        color: '#1C1C1E',
        fontWeight: '500',
    },
    filterOptionTextSelected: {
        color: COLORS.secondary,
        fontWeight: '600',
    },
    filterOptionCheck: {
        fontSize: 16,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 16,
        color: '#8E8E93',
        fontWeight: '600',
    },
    applyButton: {
        flex: 1,
        backgroundColor: COLORS.secondary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        color: 'black',
        fontWeight: '600',
    },
    createButtonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    createButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        color: COLORS.light,
        fontSize: 16,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    fabText: {
        fontSize: 24,
        color: COLORS.light,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ListRMA;