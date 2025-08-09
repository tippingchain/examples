// src/components/notifications/useTransactionNotifications.ts
import { useNotifications } from './NotificationProvider';
import { 
  transactionHistoryService, 
  addTipToHistory, 
  addApprovalToHistory, 
  addCreatorRegistrationToHistory,
  updateTransactionSuccess,
  updateTransactionError
} from '../../services/transactionHistoryService';

export const useTransactionNotifications = () => {
  const { addNotification, updateNotification } = useNotifications();

  const notifyApprovalPending = async (
    tokenSymbol: string, 
    tokenAddress: string, 
    spenderAddress: string, 
    amount: string, 
    chainId: number,
    transactionHash?: string
  ) => {
    // Add to transaction history
    const historyId = await addApprovalToHistory({
      chainId,
      tokenSymbol,
      tokenAddress,
      spenderAddress,
      amount,
    });
    
    // If we have a transaction hash, update the history immediately
    if (transactionHash) {
      await transactionHistoryService.updateTransaction(historyId, {
        sourceTransactionHash: transactionHash,
      });
    }
    
    return addNotification({
      type: 'pending',
      title: 'Token Approval Pending',
      message: `Approving ${tokenSymbol} spending...`,
      transactionHash,
      chainId,
      duration: 0, // Keep until updated
      actions: [
        {
          label: 'View History',
          action: () => window.location.href = '/examples/history'
        }
      ],
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

  const notifyTipPending = async (
    amount: string, 
    tokenSymbol: string, 
    creatorId: number, 
    creatorWallet: string,
    tokenAddress: string | undefined,
    chainId: number,
    estimatedUsdValue?: string,
    platformFee?: string,
    transactionHash?: string
  ) => {
    // Add to transaction history
    const historyId = await addTipToHistory({
      sourceChainId: chainId,
      creatorId,
      creatorWallet,
      tokenSymbol,
      tokenAddress,
      amount,
      amountWei: (parseFloat(amount) * Math.pow(10, 18)).toString(), // Rough conversion
      estimatedUsdValue,
      platformFee,
    });
    
    // If we have a transaction hash, update the history immediately
    if (transactionHash) {
      await transactionHistoryService.updateTransaction(historyId, {
        sourceTransactionHash: transactionHash,
      });
    }
    
    return addNotification({
      type: 'pending',
      title: 'Tip Transaction Pending',
      message: `Sending ${amount} ${tokenSymbol} to Creator #${creatorId}...`,
      transactionHash,
      chainId,
      duration: 0, // Keep until updated
      actions: [
        {
          label: 'View History',
          action: () => window.location.href = '/examples/history'
        }
      ],
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

  const notifyCreatorAdded = async (
    creatorId: number, 
    wallet: string, 
    membershipTier: number,
    chainId: number,
    transactionHash?: string
  ) => {
    // Add to transaction history
    if (transactionHash) {
      const historyId = await addCreatorRegistrationToHistory({
        chainId,
        creatorWallet: wallet,
        membershipTier,
      });
      
      await transactionHistoryService.updateTransaction(historyId, {
        status: 'success',
        sourceTransactionHash: transactionHash,
        registeredCreatorId: creatorId,
      });
    }
    
    return addNotification({
      type: 'success',
      title: 'Creator Added Successfully',
      message: `Creator #${creatorId} (${wallet.slice(0, 8)}...) has been registered`,
      transactionHash,
      chainId,
      duration: 6000,
      actions: [
        {
          label: 'View History',
          action: () => window.location.href = '/examples/history'
        }
      ],
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