import { Request, Response, NextFunction } from 'express';
import { generateEsgPdfReport, ReportFilter } from '../services/pdfService';
import '../middleware/auth';

export async function downloadPdfReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    const userId = req.user!.id;
    const { period, startDate, endDate } = req.query;

    const filter: ReportFilter = {
      period: (period as any) || 'all',
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    };

    const pdfBuffer = await generateEsgPdfReport(orgId, filter, userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="SustainIQ_ESG_Report_${orgId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.status(200).send(pdfBuffer);
  } catch (err: any) {
    if (err.message === 'Organization not found') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    next(err);
  }
}
