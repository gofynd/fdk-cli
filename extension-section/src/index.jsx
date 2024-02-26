import { ReviewRating } from "./components/rating";


window.FPI.extension.onAppReady(() => {
    window.FPI.extension.register([
        {
            target: "#review-list",
            component: ReviewRating,
        },
    ]);
});

