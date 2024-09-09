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

export const MIXED_THRESHOLD = 55


// confusing: Senior Program Associate, Tax Manager, 
// small summary, plus salary? 
export function getPoliticalType(percentBlue) {
    let correctAnswer = ''
    if (percentBlue <= MIXED_THRESHOLD && percentBlue >= (100 - MIXED_THRESHOLD)) {
        correctAnswer = 'mixed'
    } else if (percentBlue < 50) {
        correctAnswer = 'republican'
    } else {
        correctAnswer = 'democrat'
    }

    return correctAnswer
}

export function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }
  