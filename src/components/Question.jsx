import { useEffect, useState } from "react";
import { app } from "../firebase/app";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";

export const TwoQuestions = () => {
    const [questions, setQuestions] = useState([]);
    // Get today's date
    let today = new Date();

    // Specify the date you want to compare against today
    let givenDate = new Date("2024-04-07");

    // Calculate the difference in milliseconds
    let timeInMilliseconds = today.getTime() - givenDate.getTime();

    // Convert milliseconds to days and round down
    const [day, setDay] = useState(10);
    const [questionsCount, setQuestionsCount] = useState(0);

    const FetchMetaDay = async () => {
        const db = getFirestore(app);

        // Assuming `db` is your Firestore database instance
        const metaDataRef = collection(db, 'metadata', '2gp', 'day');

        // Execute the query and log the results
        try {
            const querySnapshot = await getDocs(metaDataRef);
            let data = querySnapshot.docs.map((doc) => doc.data());
            setQuestionsCount(data[0].day);
            setDay(data[0].day);
        } catch (error) {
            console.error("Error fetching user data: ", error);
        }
    }

    const FetchQuestions = async (day) => {
        const db = getFirestore(app);

        // Assuming `db` is your Firestore database instance
        const questionsRef = collection(db, "questions");

        // Create a query that filters cities where the state is equal to 'CA'
        const q = query(questionsRef, where("day", "==", day));

        // Execute the query and log the results
        try {
            const querySnapshot = await getDocs(q);
            let data = querySnapshot.docs.map((doc) => doc.data());
            setQuestions(data);
        } catch (error) {
            console.error("Error fetching user data: ", error);
        }
    }

    const PreviousButton = () => {
        let previousDay = day - 1;
        return <>
            {previousDay > 0 &&
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setDay(previousDay)}>
                    Day {previousDay}
                </button>}
        </>
    }

    const NextButton = () => {
        let nextDay = (day + 1) < questionsCount ? day + 1 : questionsCount;
        return <>
            {day != questionsCount && <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setDay(nextDay)}>
                Day {nextDay}
            </button>}
        </>
    }

    const RenderLaTeX = () => {
        renderMathInElement(document.body, {
            // customised options
            // • auto-render specific keys, e.g.:
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true },
            ],
            // • rendering keys, e.g.:
            throwOnError: false,
        });
    }

    useEffect(() => {
        FetchQuestions(day);
    }, [day]);

    useEffect(() => {
        RenderLaTeX();
    }, [questions]);

    useEffect(() => {
        FetchMetaDay();
    }, []);
    return <>
        <div className="flex justify-between">
            <PreviousButton />
            <NextButton />
        </div>
        <header>
            <h1
                className="flex items-center content-center justify-center text-xl mt-5 mx-2"
            >
                Two Questions Programme - Day {day}
            </h1>
        </header>

        <div className="m-4">
            {
                questions && questions.map((d, i) => {
                    return (
                        <div className="mb-10 text-justify overflow-x-auto overflow-y-hidden" key={d.question}>
                            <div className="font-bold">
                                {i + 1}. {d.question}{" "}
                                <span className="font-semibold">
                                    {d.remarks && `[${d.remarks}]`}
                                </span>
                            </div>
                            <div className="mx-2 w-75 mt-2">{d.solution}</div>
                        </div>
                    );
                })
            }
        </div>
    </>
}