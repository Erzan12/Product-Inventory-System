import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Response } from 'express';

@Controller('api/invoice')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}

    //Plain Invoice Receipt
    @Get(':orderId')
    getInvoice(@Param('orderId', ParseIntPipe) orderId: number) {
        return this.invoiceService.generateBasicInvoice(orderId);
    }

    // //PDF Invoice Receipt
    // @Get(':orderId/pdf')
    // generatePdf(@Param('orderId') orderId: number, @Res() res: Response) {
    //     return this.invoiceService.generatePDFInvoice(+orderId, res)
    // }

    //Email Invoice Recept
    // @Get(':orderId/mail')
    // generateEmail(@Param('orderId') orderId: number) {
    //     return this.invoiceService.sendInvoicePDFEmail(+orderId)
    // }
}
