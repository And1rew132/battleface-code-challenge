import { Component, computed, input } from '@angular/core';
import { QuotationResponse } from '../../quotation-api.service';

@Component({
  selector: 'app-quote-result',
  templateUrl: './quote-result.html',
  styleUrl: './quote-result.scss',
})
export class QuoteResult {
  readonly quote = input.required<QuotationResponse>();

  protected readonly resultLine = computed(() => {
    const quote = this.quote();

    return `${quote.total} ${quote.currency_id}`;
  });
}
