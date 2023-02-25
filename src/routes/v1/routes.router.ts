import express, { Request, Response, NextFunction } from 'express';

// import route files
// import authRoutes from './routers/auth.router'

// create router
const router = express.Router();

// define routes
// router.use('/auth', authRoutes);

router.get('/', (req: Request, res: Response, next: NextFunction) => {

    res.status(200).json({
        error: false,
        errors: [],
        message: 'successful',
        data: {
            name: 'crowdfund-dapp',
            version: '1.0.0'
        },
        status: 200
    })

});

export default router;