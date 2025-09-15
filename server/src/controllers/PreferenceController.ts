import { Request, Response } from 'express';

import Preference from '@server/models/Preference';
import { BaseController } from '@server/controllers/BaseController';
import { broadcast } from '@server/plugins/io/clientNamespace';

class PreferenceController extends BaseController {
  protected async getPreferenceByID(req: Request): Promise<Preference | undefined> {
    const user = await this.getUserID(req);

    if (!user) {
      return;
    };

    const preference = await Preference.findOne({ where: { userID: user.id } });

    if (!preference) {
      return;
    }

    return preference;
  }

  async getAllPreference(req: Request, res: Response) {
    try {
      const user = await this.getUserID(req);

      if (!user) {
        return;
      };

      const preference = await Preference.findAll({
        where: { userID: user.id },
        order: [['createdAt', 'DESC']],
      });

      res.json(preference);
    } catch(error) {
      this.handleError(res, (error as Error), 'Failed to get preference');
    }
  }

  async createNewPreference(req: Request, res: Response) {
    try {
      const user = await this.getUserID(req);

      if (!user) {
        return;
      };

      const preference = await Preference.create({
        ...req.body,
        userID: user.id
      });

      broadcast('new_preference', { data: preference });

      res.status(201).json(preference);
    } catch(error) {
      this.handleError(res, (error as Error), 'Failed to create preference');
    }
  }

  async getByID(req: Request, res: Response) {
    try {
      const preference = await this.getPreferenceByID(req);

      res.json(preference);
    } catch(error) {
      this.handleError(res, (error as Error), 'Failed to get preference');
    }
  }

  async updateByID(req: Request, res: Response) {
    try {
      const preference = await this.getPreferenceByID(req);

      if (!preference) {
        res.status(404).json({ message: 'Preference not found' });

        return;
      }

      await preference.update(req.body);

      broadcast('update_preference', { data: preference });

      res.json(preference);
    } catch(error) {
      this.handleError(res, (error as Error), 'Failed to update preference');
    }
  }

  async deleteByID(req: Request, res: Response) {
    try {
      const preference = await this.getPreferenceByID(req);

      if (!preference) {
        res.status(404).json({ message: 'Preference not found' });

        return;
      }

      await preference.destroy();

      broadcast('delete_preference', { data: preference });

      res.json({ message: 'Preference deleted successfully' });
    } catch(error) {
      this.handleError(res, (error as Error), 'Failed to delete preference');
    }
  }
}

export default new PreferenceController();
