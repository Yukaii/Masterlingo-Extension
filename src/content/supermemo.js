function calcFactor(oldFac, quality) {
  let newFac = oldFac + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newFac > 2.5) newFac = 2.5;
  if (newFac < 1.3) newFac = 1.3;
  return newFac;
}

/**
 * @params {number} a number between 0~5 representing the quality of review. 0 is the worse while 5 is the best.
 * @params {number} the factor of last schedual
 */
function supermemo(quality, { schedule, factor, repetition }) {
  let curSchedule,
    newFactor,
    newRepetition,
    lastSchedule = schedule,
    lastFactor = factor;

  if (!repetition) {
    newRepetition = 1;
    newFactor = 2.5;
  } else {
    newRepetition = repetition + 1;
    console.log('got here');
    console.log(newRepetition);
  }
  if (quality < 3) {
    console.log('quality under 3');
    newRepetition = 0;
    curSchedule = 0;

    if (lastFactor) {
      newFactor = calcFactor(lastFactor, quality);
    }
  } else {
    if (lastFactor) {
      newFactor = calcFactor(lastFactor, quality);
      console.log(`new factor is ${newFactor}`);
    }
    curSchedule = Math.round(lastSchedule * newFactor);
  }

  if (newRepetition === 1) {
    if (quality < 5) {
      curSchedule = 2;
    } else {
      curSchedule = 6;
    }
  }
  let dueDate = new Date();
  if (quality >= 3) {
    console.log('1b');
    if (quality === 5) {
      curSchedule = Math.round(curSchedule * 1.4);
    }
    dueDate = addSubtractDate.add(dueDate, Math.round(curSchedule / 2), 'days');
    // only 1/2 of current schedule gets added compared to the app version where 100% gets added
  }

  console.log('before return' + newRepetition);
  return {
    factor: newFactor,
    schedule: curSchedule,
    isRepeatAgain: quality < 4,
    repetition: newRepetition,
    dueDate
  };
}

export default supermemo;
