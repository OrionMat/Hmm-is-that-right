import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { paperOfYearQaBodySchema } from "../schemas/paperOfYear.schema";
import { paperOfYearGetController, paperOfYearQaController } from "../controllers/paperOfYear.controller";

export const paperOfYearRoute = Router();

paperOfYearRoute.get("/", paperOfYearGetController);

paperOfYearRoute.post(
  "/qa",
  validateRequest({ body: paperOfYearQaBodySchema }),
  paperOfYearQaController,
);
