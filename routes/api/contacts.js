import { Router } from "express";

import { isValidateId, authenticate, upload } from "../../middlewars/index.js";

const contactsRouter = Router();

import {contactControl} from '../../controllers/index.js';

contactsRouter.use(authenticate);

contactsRouter.get("/", contactControl.getAll);

contactsRouter.get("/:id", isValidateId, contactControl.getById);

contactsRouter.post("/", upload.single("avatar"), contactControl.createNewContact);

contactsRouter.delete("/:id", isValidateId, contactControl.deleteById);

contactsRouter.put("/:id", isValidateId, contactControl.updateContactById);

contactsRouter.patch("/:id/favorite", isValidateId, contactControl.updateFavorite);

export default contactsRouter;
