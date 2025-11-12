<script lang="ts">
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden flex items-center justify-center">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
		<div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
		<div class="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
	</div>

	<!-- Hero Content -->
	<div class="text-center relative z-10 animate-fade-in">
		<div class="inline-block mb-6">
			<div class="text-9xl mb-4 animate-bounce-slow">🎲</div>
		</div>
		<h1 class="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 tracking-tight leading-tight">
			Inspire Tables
		</h1>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes bounce-slow {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.8s ease-out;
	}

	.animate-bounce-slow {
		animation: bounce-slow 3s ease-in-out infinite;
	}

	.delay-500 {
		animation-delay: 500ms;
	}

	.delay-1000 {
		animation-delay: 1000ms;
	}
</style>
