import { Router } from 'express'
import UserManager from '../dao/fsManagers/userManager.js';

const router = Router()
const manager = new UserManager()

router.get('/', async (req, res) => {
    try {
        const users = await manager.getUsers();
        res.render('users', { success: true, data: users });
    } catch (err) {
        res.status(500).send({ success: false, error: err.message });
    }
});

export default router