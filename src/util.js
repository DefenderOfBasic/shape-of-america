export function computeLocalAccuracy() {
    const results = JSON.parse(localStorage.getItem('results'))
    const accuracy = results.guesses.filter(g => g.correct).length / results.guesses.length
    return accuracy
}

export async function computeGlobalAccuracy(supabase) {
    const correctResult = await supabase
        .from('user_guesses')
        .select('*', { count: 'exact', head: true })
        .eq('correct', true)
    
    const incorrectResult = await supabase
        .from('user_guesses')
        .select('*', { count: 'exact', head: true })
        .eq('correct', false)

    const globalAccuracy = correctResult.count / (correctResult.count + incorrectResult.count)
    if (!globalAccuracy) return 
    document.querySelector("#global-accuracy").innerText = Math.round(globalAccuracy * 100)

    return globalAccuracy
}