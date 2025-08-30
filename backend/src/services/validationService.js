const Joi = require('joi');

const productSchema = Joi.object({
  ref: Joi.string().required().messages({
    'string.empty': 'La référence produit est obligatoire',
    'any.required': 'La référence produit est obligatoire'
  }),
  label: Joi.string().required().messages({
    'string.empty': 'Le nom du produit est obligatoire',
    'any.required': 'Le nom du produit est obligatoire'
  }),
  type: Joi.number().valid(0, 1).default(0),
  status: Joi.number().valid(0, 1).default(1),
  status_buy: Joi.number().valid(0, 1).default(1),
  status_sell: Joi.number().valid(0, 1).default(1),
  price: Joi.number().min(0).optional(),
  stock_initial: Joi.number().min(0).optional(),
  valeur_stock_initial: Joi.number().min(0).optional()
});

const bomSchema = Joi.object({
  ref: Joi.string().required().messages({
    'string.empty': 'La référence BOM est obligatoire',
    'any.required': 'La référence BOM est obligatoire'
  }),
  label: Joi.string().required().messages({
    'string.empty': 'Le libellé BOM est obligatoire',
    'any.required': 'Le libellé BOM est obligatoire'
  }),
  bomtype: Joi.number().valid(0, 1).default(0),
  qty: Joi.number().min(1).default(1),
  status: Joi.number().valid(0, 1).default(1),
  fk_product: Joi.alternatives().try(
    Joi.string(),
    Joi.number()
  ).optional(),
  lines: Joi.array().items(
    Joi.object({
      fk_product: Joi.alternatives().try(
        Joi.string().required(),
        Joi.number().required()
      ),
      qty: Joi.number().min(0).required()
    })
  ).optional()
});

class ValidationService {
  validateProduct(data) {
    return productSchema.validate(data, { abortEarly: false });
  }

  validateBOM(data) {
    return bomSchema.validate(data, { abortEarly: false });
  }
}

module.exports = new ValidationService();
