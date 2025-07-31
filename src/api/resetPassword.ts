import axiosInstance from './axiosConfig';

interface ResetPasswordPayload {
    email: string;
    newPassword: string;
    resetToken: string;
}

export const requestPasswordReset = async (email: string): Promise<void> => {
    try {
        const response = await axiosInstance.put('/rest/V1/customers/password', { email,template: 'email_reset'});
        if (response.status !== 200) {
            throw new Error('Failed to request password reset');
        }
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<boolean> => {
    try {
        const response = await axiosInstance.post('/rest/V1/customers/resetPassword', payload);
        if (response.status !== 200) {
            throw new Error('Failed to reset password');
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const checkResetToken = async (resetToken: string): Promise<void> => {
    try {
        const response = await axiosInstance.get(`/rest/V1/customers/password/resetLinkToken/${resetToken}`);
        if (response.status !== 200) {
            throw new Error('Failed to check reset token');
        }
    } catch (error) {
        throw error;
    }
}