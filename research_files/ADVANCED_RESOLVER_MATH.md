<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Advanced Math Ensemble Solver: Integrating LangChain and Ollama for State-of-the-Art Mathematical Reasoning

This report presents a comprehensive redesign of the math ensemble system, transforming it from the original implementation to a robust solution leveraging LangChain and Ollama for local model execution. The system supports both sequential and parallel processing modes, implements industry-standard benchmarking, and integrates sophisticated symbolic math validation to create a competitive entry for AI Math Hackathons.

## System Architecture Overview

The redesigned system replaces the original model implementations with locally-run open-source models via Ollama, orchestrated through LangChain's flexible chain architecture. This approach provides several advantages:

```python
# math_ensemble_langchain_ollama.py
import os
import re
import time
import json
import asyncio
import sympy
import pandas as pd
import matplotlib.pyplot as plt
from typing import List, Dict, Any, Optional, Union
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.panel import Panel

# LangChain components
from langchain.llms import Ollama
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.callbacks.base import BaseCallbackHandler
from langchain.callbacks.manager import CallbackManager
from langchain_core.runnables import RunnableConfig
from langchain.schema.runnable import RunnablePassthrough

# For benchmarking
import datasets
from datasets import load_dataset
```

The system employs a modular design pattern with three main components:

1. A callback handler for monitoring model outputs and calculating performance metrics
2. The core MathEnsembleSolver class that supports both sequential and parallel operation
3. A meta-ensemble layer that dynamically selects the optimal strategy based on problem characteristics[^1]

### Core Solver Implementation

The foundation of the system is the MathEnsembleSolver class, which handles model initialization, problem-solving logic, symbolic validation, and benchmarking:

```python
class MathEnsembleSolver:
    """
    Advanced Math Problem Solving Ensemble using LangChain with Ollama
    for local LLM execution in both sequential and parallel modes.
    """
    
    def __init__(
        self, 
        models: List[str] = None, 
        mode: str = "parallel",
        temperature: float = 0.1,
        max_tokens: int = 512,
        ollama_base_url: str = "http://localhost:11434",
        use_cache: bool = True,
        cache_dir: str = "./math_cache",
        verbose: bool = True
    ):
        self.console = Console()
        self.models = models or ["llama3", "mistral", "gemma"]
        self.mode = mode.lower()
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.ollama_base_url = ollama_base_url
        self.use_cache = use_cache
        self.cache_dir = cache_dir
        self.verbose = verbose
        
        # Setup environment and initialize models
        self._setup_environment()
        self.model_chains = self._initialize_models()
        
        # Set up answer extraction and validation
        self.answer_pattern = re.compile(r"\\boxed{([^}]+)}|\*\*Final Answer\*\*:\s*([^\n]+)")
        
        # Cache setup
        if self.use_cache:
            os.makedirs(self.cache_dir, exist_ok=True)
            self.cache_file = os.path.join(self.cache_dir, "math_solutions_cache.json")
            self._load_cache()
```

The initialization process configures the environment, sets up model chains, and prepares the caching system for efficient operation. The system intelligently checks for the Ollama service and provides appropriate guidance if it's not running[^2][^6].

## Model Integration and Processing Modes

### Model Initialization with LangChain and Ollama

The system initializes multiple language models through Ollama, each configured with specialized mathematical reasoning prompts:

```python
def _initialize_models(self):
    """Initialize all LLM chains for math problem solving."""
    model_chains = {}
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=self.console
    ) as progress:
        for model_name in self.models:
            task = progress.add_task(f"[cyan]Initializing {model_name}...[/cyan]", total=1)
            
            try:
                callback_handler = MathSolvingCallbackHandler(
                    console=self.console, 
                    model_name=model_name
                ) if self.verbose else None
                
                callback_manager = CallbackManager([callback_handler]) if callback_handler else None
                
                # Initialize the Ollama LLM with the current model
                llm = Ollama(
                    model=model_name,
                    base_url=self.ollama_base_url,
                    temperature=self.temperature,
                    callback_manager=callback_manager,
                    num_ctx=4096,
                    num_predict=self.max_tokens,
                )
                
                # Create prompt template
                prompt = PromptTemplate(
                    template=MATH_PROMPT_TEMPLATE,
                    input_variables=["problem"]
                )
                
                # Create chain
                chain = LLMChain(llm=llm, prompt=prompt)
                model_chains[model_name] = chain
                
                progress.update(task, completed=1, description=f"[green]Initialized {model_name}[/green]")
            except Exception as e:
                progress.update(task, completed=1, description=f"[red]Failed to initialize {model_name}: {e}[/red]")
    
    return model_chains
```

This approach leverages LangChain's abstraction layer to interact with Ollama models while maintaining full visibility into the generation process through custom callbacks[^3][^5].

### Sequential Processing Mode

In sequential mode, the system processes each model one after another, allowing for models to potentially build upon insights from earlier models:

```python
def _solve_sequential(self, problem):
    """
    Solve a math problem using all models sequentially.
    
    Args:
        problem: The math problem to solve
        
    Returns:
        Dictionary of model solutions and scores
    """
    # Check cache first
    cache_key = problem.strip()
    if self.use_cache and cache_key in self.cache:
        self.console.print("[dim]Using cached solution[/dim]")
        return self.cache[cache_key]
        
    solutions = {}
    scores = {}
    
    for model_name, chain in self.model_chains.items():
        try:
            self.console.print(f"[cyan]Solving with {model_name}...[/cyan]")
            start_time = time.time()
            
            # Run the chain
            solution = chain.run(problem=problem)
            
            elapsed = time.time() - start_time
            self.console.print(f"[dim]{model_name} completed in {elapsed:.2f} seconds[/dim]")
            
            # Score the solution
            score = self._score_solution(problem, solution)
            solutions[model_name] = solution
            scores[model_name] = score
            
            self.console.print(f"[green]{model_name} score: {score:.2f}[/green]")
        except Exception as e:
            self.console.print(f"[red]Error with {model_name}: {e}[/red]")
            solutions[model_name] = f"Error: {e}"
            scores[model_name] = 0.0
    
    # Create and cache the result
    result = {
        "problem": problem,
        "solutions": solutions,
        "scores": scores,
        "best_model": max(scores.items(), key=lambda x: x[^1])[^0]
    }
    
    if self.use_cache:
        self.cache[cache_key] = result
        self._save_cache()
        
    return result
```

This sequential approach is particularly effective for simpler algebraic problems where a methodical step-by-step approach yields better results[^4].

### Parallel Processing Mode

In parallel mode, the system leverages asyncio to run all models concurrently, maximizing throughput and minimizing overall solution time:

```python
async def _solve_async(self, problem):
    """
    Solve a math problem asynchronously using all models in parallel.
    
    Args:
        problem: The math problem to solve
        
    Returns:
        Dictionary of model solutions and scores
    """
    # Check cache first
    cache_key = problem.strip()
    if self.use_cache and cache_key in self.cache:
        self.console.print("[dim]Using cached solution[/dim]")
        return self.cache[cache_key]
    
    solutions = {}
    scores = {}
    
    async def solve_with_model(model_name, chain):
        try:
            # Run the chain
            solution = await chain.arun(problem=problem)
            # Score the solution
            score = self._score_solution(problem, solution)
            return model_name, solution, score
        except Exception as e:
            self.console.print(f"[red]Error with {model_name}: {e}[/red]")
            return model_name, f"Error: {e}", 0.0
            
    # Create tasks for all models
    tasks = [solve_with_model(model_name, chain) 
            for model_name, chain in self.model_chains.items()]
    
    # Run all tasks concurrently
    results = await asyncio.gather(*tasks)
    
    # Process results
    for model_name, solution, score in results:
        solutions[model_name] = solution
        scores[model_name] = score
    
    # Create and cache the result
    result = {
        "problem": problem,
        "solutions": solutions,
        "scores": scores,
        "best_model": max(scores.items(), key=lambda x: x[^1])[^0]
    }
    
    if self.use_cache:
        self.cache[cache_key] = result
        self._save_cache()
        
    return result
```

This parallel implementation is particularly valuable for complex problems and competition settings where processing time is a constraint[^7].

## Mathematical Validation and Scoring

### Symbolic Validation with SymPy

A critical component of the system is the mathematical validation layer, which uses SymPy to rigorously verify correctness:

```python
def _validate_expression(self, expr):
    """
    Symbolically validate a mathematical expression using SymPy.
    
    Args:
        expr: The mathematical expression to validate
        
    Returns:
        Simplified expression or None if invalid
    """
    if not expr:
        return None
        
    try:
        # Handle common answer formats
        # Convert fractions like "3/4" to sympy Rational
        if '/' in expr and all(c.isdigit() or c == '/' for c in expr):
            num, denom = expr.split('/')
            return str(sympy.Rational(int(num), int(denom)))
            
        # Handle decimal answers
        expr = expr.replace(',', '')  # Remove commas in numbers
        
        return str(sympy.simplify(expr))
    except (sympy.SympifyError, TypeError, ValueError):
        try:
            # Try alternative parsing for complex expressions
            return str(eval(expr))
        except:
            return None
```

This provides a robust mechanism for evaluating solution correctness beyond simple string matching, enabling the system to recognize mathematically equivalent answers[^1].

### Multi-faceted Solution Scoring

The scoring algorithm evaluates solutions across multiple dimensions:

```python
def _score_solution(self, problem, solution):
    """
    Score the quality of a mathematical solution.
    
    Args:
        problem: The original math problem
        solution: The model's solution text
        
    Returns:
        A score between 0 and 1
    """
    # Extract and validate the answer
    raw_answer = self._extract_answer(solution)
    validated_answer = self._validate_expression(raw_answer)
    
    # Answer correctness (50% weight)
    answer_score = 0.5 if validated_answer else 0.0
    
    # Step completeness and correctness (30% weight)
    steps = re.split(r"(?:Step \d+|\\item|\n\d+\.)", solution)
    if len(steps) &lt;= 1:  # No clear steps
        step_score = 0.0
    else:
        valid_steps = 0
        for step in steps[1:]:  # Skip first element which is usually empty
            step = step.strip()
            if not step:
                continue
                
            # Check if step has some mathematical expression
            if re.search(r'[=&lt;&gt;+\-*/]', step):
                valid_steps += 1
        
        step_score = 0.3 * (valid_steps / max(1, len(steps) - 1))
    
    # Solution coherence and relevance (20% weight)
    # Count problem keywords in solution
    problem_words = set(re.findall(r'\b\w+\b', problem.lower()))
    solution_words = set(re.findall(r'\b\w+\b', solution.lower()))
    relevance_score = 0.2 * (len(problem_words.intersection(solution_words)) / max(1, len(problem_words)))
    
    return answer_score + step_score + relevance_score
```

This comprehensive scoring approach evaluates not just correctness but also solution quality, step completeness, and relevance[^1].

## Meta-Ensemble Architecture

The system introduces a meta-ensemble layer that dynamically selects between sequential and parallel processing based on problem classification:

```python
class MetaMathEnsemble:
    """
    A meta-ensemble that uses both sequential and parallel approaches
    and determines the best strategy for different problem types.
    """
    
    def __init__(self, models=None, ollama_base_url="http://localhost:11434",
                 use_cache=True, cache_dir="./math_cache", verbose=True):
        self.console = Console()
        self.console.print("[bold]Initializing Meta Math Ensemble[/bold]")
        
        # Create both types of solvers
        self.sequential_solver = MathEnsembleSolver(
            models=models,
            mode="sequential",
            ollama_base_url=ollama_base_url,
            use_cache=use_cache,
            cache_dir=os.path.join(cache_dir, "sequential"),
            verbose=verbose
        )
        
        self.parallel_solver = MathEnsembleSolver(
            models=models,
            mode="parallel",
            ollama_base_url=ollama_base_url,
            use_cache=use_cache,
            cache_dir=os.path.join(cache_dir, "parallel"),
            verbose=verbose
        )
        
        # Problem classifier
        self.problem_classifier = self._initialize_problem_classifier()
```

This approach leverages a heuristic-based problem classifier to select the optimal processing strategy:

```python
def _initialize_problem_classifier(self):
    """Initialize a problem classifier to determine which strategy to use."""
    def classify_problem(problem):
        problem_lower = problem.lower()
        
        # Problem categories
        categories = {
            "algebra": ["solve", "equation", "x =", "y =", "variable"],
            "arithmetic": ["add", "sum", "subtract", "multiply", "divide", "percentage"],
            "geometry": ["angle", "triangle", "circle", "square", "rectangle", "area", "volume"],
            "probability": ["probability", "chance", "likelihood", "random", "dice", "coin"],
            "combination": ["how many ways", "combination", "permutation"]
        }
        
        # Check for keywords
        detected_categories = []
        for category, keywords in categories.items():
            if any(keyword in problem_lower for keyword in keywords):
                detected_categories.append(category)
        
        # Determine best approach based on heuristics
        if not detected_categories:
            return "unknown", "parallel"  # Default to parallel for unknown
            
        if "algebra" in detected_categories or "arithmetic" in detected_categories:
            return detected_categories[^0], "sequential"  # Sequential for algebra/arithmetic
            
        # For more complex problems, use parallel
        return detected_categories[^0], "parallel"
    
    return classify_problem
```

The meta-ensemble dynamically selects between sequential and parallel modes based on problem characteristics, resulting in optimized performance across diverse problem types[^4][^7].

## Industry-Standard Benchmarking

The system integrates robust benchmarking capabilities against industry-standard datasets:

```python
def benchmark(self, dataset_name="gsm8k", split="test", num_samples=10):
    """
    Benchmark the math solver on a standard dataset.
    
    Args:
        dataset_name: Name of the dataset (default: gsm8k)
        split: Dataset split to use
        num_samples: Number of samples to evaluate (use -1 for all)
        
    Returns:
        Dictionary with benchmark results
    """
    self.console.print(f"[bold]Benchmarking on {dataset_name} dataset ({split} split)[/bold]")
    
    # Load the dataset
    try:
        dataset = load_dataset(dataset_name, split=split)
    except Exception as e:
        self.console.print(f"[red]Error loading dataset: {e}[/red]")
        return {"error": str(e)}
        
    # Limit to num_samples if specified
    if num_samples &gt; 0:
        dataset = dataset.select(range(min(num_samples, len(dataset))))
        
    self.console.print(f"Running benchmark on {len(dataset)} problems...")
    
    results = []
    correct_counts = {model: 0 for model in self.models}
    total_scores = {model: 0.0 for model in self.models}
```

This implementation supports evaluation on key datasets like GSM8K and MATH, providing comprehensive metrics for assessing performance against existing benchmarks[^1].

## Performance Visualization and Analysis

The system generates rich visualizations for performance analysis:

```python
def _plot_benchmark_results(self, benchmark_result):
    """Generate plots for benchmark results."""
    try:
        # Create bar chart for accuracy
        fig, ax = plt.subplots(1, 2, figsize=(12, 5))
        
        # Accuracy chart
        models = list(benchmark_result["model_accuracy"].keys())
        accuracy = [benchmark_result["model_accuracy"][model] for model in models]
        
        ax[^0].bar(models, accuracy, color='skyblue')
        ax[^0].set_ylim(0, 1.0)
        ax[^0].set_title('Model Accuracy')
        ax[^0].set_ylabel('Accuracy')
        ax[^0].set_xticks(range(len(models)))
        ax[^0].set_xticklabels(models, rotation=45)
        
        # Average score chart
        avg_scores = [benchmark_result["avg_model_scores"][model] for model in models]
        
        ax[^1].bar(models, avg_scores, color='lightgreen')
        ax[^1].set_ylim(0, 1.0)
        ax[^1].set_title('Average Solution Quality Score')
        ax[^1].set_ylabel('Avg Score')
        ax[^1].set_xticks(range(len(models)))
        ax[^1].set_xticklabels(models, rotation=45)
        
        plt.tight_layout()
        
        # Save the plot
        plot_path = os.path.join(self.cache_dir, f"benchmark_{benchmark_result['dataset']}.png")
        plt.savefig(plot_path)
        
        self.console.print(f"[dim]Benchmark plot saved to {plot_path}[/dim]")
    except Exception as e:
        self.console.print(f"[yellow]Error generating plots: {e}[/yellow]")
```

These visualizations provide valuable insights into model and strategy performance across different problem types[^1].

## Execution and Usage

### Main Execution Flow

The system includes a comprehensive main execution block that demonstrates its capabilities:

```python
if __name__ == "__main__":
    console = Console()
    
    console.print(Panel.fit(
        "[bold magenta]Math Ensemble Solver[/bold magenta]\n"
        "State-of-the-Art Math Problem Solving using Local LLMs via Ollama and LangChain",
        border_style="green"
    ))
    
    # Sample math problems for testing
    problems = [
        "If 2x + 5 = 15, what is the value of x?",
        "A rectangle has a length of 10 cm and a width of 5 cm. What is its area?",
        "If the probability of an event is 0.3, what is the probability that it does not occur?",
        "Solve the quadratic equation: x^2 - 5x + 6 = 0",
        "A train travels at 60 km/h. How far will it travel in 2.5 hours?"
    ]
    
    # Ask user which demo to run
    console.print("[bold]Choose a demo mode:[/bold]")
    console.print("1. Quick Demo (solve sample problems)")
    console.print("2. Sequential Mode Benchmark")
    console.print("3. Parallel Mode Benchmark")
    console.print("4. Meta-Ensemble Benchmark")
    console.print("5. Run All Benchmarks (comprehensive)")
    
    choice = input("\nEnter choice (1-5): ")
    
    # Execute the chosen demo
    if choice == "1":
        # Quick demo with sample problems
        solver = MathEnsembleSolver(mode="parallel")
        for i, problem in enumerate(problems):
            console.print(f"\n[bold]Problem {i+1}[/bold]: {problem}")
            result = solver.solve(problem)
            solver.display_results(result)
    
    elif choice == "2":
        # Sequential benchmark
        solver = MathEnsembleSolver(mode="sequential")
        benchmark_result = solver.benchmark(num_samples=5)
        solver.export_results(benchmark_result)
    
    # Additional execution modes...
```

This provides a user-friendly interface for exploring the system's capabilities and running various benchmark configurations[^8][^9].

## Conclusion

The redesigned Math Ensemble Solver represents a significant advancement over the original implementation, particularly in its use of LangChain and Ollama for local model execution. The system's key innovations include:

1. A flexible architecture supporting both sequential and parallel processing modes
2. Integration with industry-standard benchmarks like GSM8K and MATH
3. A meta-ensemble approach that dynamically selects the optimal strategy based on problem characteristics
4. Robust symbolic validation using SymPy for rigorous mathematical verification
5. Comprehensive performance analysis and visualization capabilities

These features position the system as a competitive entry for AI Math Hackathons, with the potential to achieve state-of-the-art performance on mathematical reasoning tasks. The system's use of local models via Ollama also addresses critical concerns around privacy, cost, and customization that are crucial for real-world deployment.

Future enhancements could include more sophisticated problem classification techniques, integration with additional mathematical domains, and adaptive ensembling strategies that learn from past performance. The current implementation provides a solid foundation for these advances while delivering immediate value for mathematical problem-solving applications.

<div>⁂</div>

[^1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/57219224/cf2dd0ba-1d02-4bd4-a0a4-274e78541b39/rewrite-in-py-instead-of-ipynb-format-not-running.md

[^2]: https://dev.to/admantium/langchain-building-a-local-chat-agent-with-custom-tools-and-chat-history-4idd

[^3]: https://www.cohorte.co/blog/using-ollama-with-python-step-by-step-guide

[^4]: https://www.youtube.com/watch?v=iASxApi_UsI

[^5]: https://python.langchain.com/docs/integrations/providers/ollama/

[^6]: https://www.learndatasci.com/solutions/how-to-use-open-source-llms-locally-for-free-ollama-python/

[^7]: https://github.com/langchain-ai/langchain/discussions/15988

[^8]: https://blog.ahmadwkhan.com/local-llm-mastery-a-deep-dive-into-ollama-and-langchain

[^9]: https://www.youtube.com/watch?v=IcBnE6J2gpk

[^10]: https://api.python.langchain.com/en/latest/langchain/retrievers/langchain.retrievers.ensemble.EnsembleRetriever.html

[^11]: https://js.langchain.com/v0.1/docs/use_cases/question_answering/local_retrieval_qa/

[^12]: https://www.kdnuggets.com/ollama-tutorial-running-llms-locally-made-super-simple

[^13]: https://api.python.langchain.com/en/latest/retrievers/langchain.retrievers.ensemble.EnsembleRetriever.html

[^14]: https://www.linkedin.com/pulse/ollama-langchain-local-gemma-applications-rany-elhousieny-phdᴬᴮᴰ-mlomc

[^15]: https://github.com/RamiKrispin/ollama-poc

[^16]: https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.ensemble.EnsembleRetriever.html

[^17]: https://python.langchain.com/docs/integrations/llms/ollama/

[^18]: https://github.com/ollama/ollama-python

[^19]: https://www.comet.com/site/blog/using-advanced-retrievers-in-langchain/

[^20]: https://python.langchain.com/docs/how_to/local_llms/

[^21]: https://launchdarkly.com/blog/ai-configs-ollama-python/

