// src/components/notifications/useTransactionNotifications.ts
import { useNotifications } from './NotificationProvider';

export const useTransactionNotifications = () => {
  const { addNotification, updateNotification } = useNotifications();

  const notifyApprovalPending = (tokenSymbol: string, transactionHash?: string, chainId?: number) => {
    return addNotification({
      type: 'pending',
      title: 'Token Approval Pending',
      message: `Approving ${tokenSymbol} spending...`,
      transactionHash,
      chainId,
      duration: 0, // Keep until updated
    });
  };

  const notifyApprovalSuccess = (tokenSymbol: string, transactionHash?: string, chainId?: number) => {
    return addNotification({
      type: 'success',
      title: 'Token Approved Successfully',
      message: `${tokenSymbol} is now approved for spending`,
      transactionHash,
      chainId,
      duration: 5000,
    });
  };

  const notifyApprovalError = (tokenSymbol: string, error: string) => {
    return addNotification({
      type: 'error',
      title: 'Token Approval Failed',
      message: `Failed to approve ${tokenSymbol}: ${error}`,
      duration: 8000,
    });
  };

  const notifyTipPending = (amount: string, tokenSymbol: string, creatorId: number, transactionHash?: string, chainId?: number) => {
    return addNotification({
      type: 'pending',
      title: 'Tip Transaction Pending',
      message: `Sending ${amount} ${tokenSymbol} to Creator #${creatorId}...`,
      transactionHash,
      chainId,
      duration: 0, // Keep until updated
    });
  };

  const notifyTipSuccess = (
    amount: string, 
    tokenSymbol: string, 
    creatorId: number, 
    estimatedUsdc?: string,
    transactionHash?: string, 
    chainId?: number
  ) => {
    const message = estimatedUsdc 
      ? `${amount} ${tokenSymbol} sent to Creator #${creatorId}. Estimated USDC: ~$${estimatedUsdc}`
      : `${amount} ${tokenSymbol} sent to Creator #${creatorId}`;
    
    return addNotification({
      type: 'success',
      title: 'Tip Sent Successfully! 🎉',
      message,
      transactionHash,
      chainId,
      duration: 8000,
    });
  };

  const notifyTipError = (amount: string, tokenSymbol: string, creatorId: number, error: string) => {
    return addNotification({
      type: 'error',
      title: 'Tip Transaction Failed',
      message: `Failed to send ${amount} ${tokenSymbol} to Creator #${creatorId}: ${error}`,
      duration: 10000,
    });
  };

  const notifyCreatorAdded = (creatorId: number, wallet: string, transactionHash?: string, chainId?: number) => {
    return addNotification({
      type: 'success',
      title: 'Creator Added Successfully',
      message: `Creator #${creatorId} (${wallet.slice(0, 8)}...) has been registered`,
      transactionHash,
      chainId,
      duration: 6000,
    });
  };

  const notifyCreatorError = (error: string) => {
    return addNotification({
      type: 'error',
      title: 'Creator Registration Failed',
      message: error,
      duration: 8000,
    });
  };

  const notifyBalanceRefresh = () => {
    return addNotification({
      type: 'info',
      title: 'Balances Updated',
      message: 'Token balances have been refreshed',
      duration: 3000,
    });
  };

  const notifyNetworkSwitch = (networkName: string) => {
    return addNotification({
      type: 'info',
      title: 'Network Switched',
      message: `Connected to ${networkName}`,
      duration: 4000,
    });
  };

  const updateNotificationStatus = (notificationId: string, type: 'success' | 'error', title: string, message?: string, transactionHash?: string) => {
    updateNotification(notificationId, {
      type,
      title,
      message,
      transactionHash,
      duration: type === 'success' ? 6000 : 8000,
    });
  };

  return {
    // Approval notifications
    notifyApprovalPending,
    notifyApprovalSuccess,
    notifyApprovalError,
    
    // Tip notifications
    notifyTipPending,
    notifyTipSuccess,
    notifyTipError,
    
    // Creator management notifications
    notifyCreatorAdded,
    notifyCreatorError,
    
    // General notifications
    notifyBalanceRefresh,
    notifyNetworkSwitch,
    
    // Update existing notifications
    updateNotificationStatus,
  };
};