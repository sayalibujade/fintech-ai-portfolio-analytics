import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MOCK_PORTFOLIOS, PortfolioProfile, SAMPLE_QUESTIONS } from '../../../../core/mock-data/mock-portfolios';
import { AiInsightsService } from '../../services/ai-insights-service';
import { MarkdownPipe } from '../../utils/markdown-pipe';

@Component({
  imports: [CommonModule, FormsModule, MarkdownPipe],
  selector: 'app-ai-insights',
  styleUrl: './ai-insights.scss',
  templateUrl: './ai-insights.html',
})
export class AiInsights {
  private aiService = inject(AiInsightsService);
  private destroyRef = inject(DestroyRef); 

  portfolios = signal<PortfolioProfile[]>(MOCK_PORTFOLIOS);
  selectedPortfolioId = signal<string>(MOCK_PORTFOLIOS[0].id);
  sampleQuestions = signal<string[]>(SAMPLE_QUESTIONS);

  customQuery = signal<string>('');
  aiResponse = signal<string>('');
  isLoading = signal<boolean>(false);

  activePortfolio = computed(() => this.portfolios().find(p => p.id === this.selectedPortfolioId()));

  selectPortfolio(id: string): void {
    this.selectedPortfolioId.set(id);
    this.aiResponse.set('');
  }

  askAi(promptText: string) {
    if (this.isLoading() || !promptText.trim()) return;

    this.isLoading.set(true);
    this.aiResponse.set('');

    this.aiService.analyzePortfolio(promptText)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.aiResponse.set(res.analysis);
          this.isLoading.set(false);
          this.customQuery.set('');
        },
        error: (err) => {
          console.error('Ai Insights Error:', err);
          this.aiResponse.set('**Error:** The financial analysis model is currently experiencing high traffic spikes. Please wait a moment and try again.');
          this.isLoading.set(false);
        }
      });
  }
}
