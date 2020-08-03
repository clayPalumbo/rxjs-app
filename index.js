import { fromEvent, timer } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { takeUntil, tap, finalize, switchMapTo, exhaustMap, map } from 'rxjs/operators';

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const pollingStatus = document.getElementById("polling-status");
const dogImage = document.getElementById("dog");
const scrollBar = document.getElementById("scroll-bar");
const bg = document.getElementById('bg');

const calculateScrollPercent = (element) => {
    const {scrollTop, scrollHeight, clientHeight} = element;
    return (scrollTop / ( scrollHeight - clientHeight)) * 100;
};

//streams
const startClick$ = fromEvent(
    startButton, 'click'
);

const stopClick$ = fromEvent(
    stopButton, 'click'
);

const scroll$ = fromEvent(document, 'scroll');

const progress$ = scroll$.pipe(
    map(({target}) => calculateScrollPercent(target.scrollingElement)),
    tap((percent) => {
        scrollBar.style.width = `${percent}%`
        bg.style.backgroundPositionY = `${percent / 5}%`
    })
);


startClick$.pipe(
    exhaustMap(() => timer(0, 5000).pipe(
        tap(() => pollingStatus.innerHTML = "Start"),
        switchMapTo(
            ajax.getJSON("https://random.dog/woof.json")
        ),
        takeUntil(stopClick$),
        finalize(() => pollingStatus.innerHTML = "Stopped")
    ))
).subscribe(dog => dogImage.src = dog.url);

progress$.subscribe();
