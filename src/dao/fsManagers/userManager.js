import userModel from '../models/user.model.js';

export default class UserManager {
    constructor() {
    }

    async getUsers() {
        try {
            const users = await userModel.find().lean();
            return { success: true, data: users };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }    
}