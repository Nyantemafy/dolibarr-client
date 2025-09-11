import express from 'express';
import ProductController from '../controller/ProductController.js';

const router = express.Router();

router.post('/create', ProductController.createProduct);
router.get('/liste', ProductController.getAllProduct);
router.put('/update/:id', ProductController.updateProducts);
router.get('/delete/:id', ProductController.deleteProducts);
router.post('/correct', ProductController.correctStock);
router.get("/getById/:id", (req, res) => ProductController.getProductByIdD(req, res));
router.get('/finished', (req, res) => {
  ProductController.getFinishedProducts(req, res);
});

export default router;