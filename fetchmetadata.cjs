const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Reference to the Firestore database
const db = admin.firestore();

// Fetch all documents from the "topics" collection within each "paper" document
const fetchTopics = async () => {
    try {
        // get all subtopics
        const subtopicsSnapshot = await db.collectionGroup('subtopics').get();
        const subtopicsData = [];
        subtopicsSnapshot.forEach((doc) => {
            const subtopic = { subtopicName: doc.data().name, subtopicId: doc.id, topicId: doc.ref.parent.parent?.id };
            subtopicsData.push(subtopic);
        });

        // get all topics
        const topicsSnapshot = await db.collectionGroup('topics').get();
        const topicsData = [];
        topicsSnapshot.forEach((doc) => {
            const topic = { topicName: doc.data().name, topicId: doc.id, paperId: doc.ref.parent.parent?.id };
            topicsData.push(topic);
        });

        // combine subtopics to topic as a property of subtopics[]
        const combinedTopics = topicsData.map((t) => {
            const subtopicsArray = subtopicsData.filter(s => s.topicId == t.topicId).map(d => ({ subtopicName: d.subtopicName, subtopicId: d.subtopicId }))
            const combinedTopic = { ...t, subtopics: subtopicsArray }
            return combinedTopic;
        })

        // combine topics into papers
        function groupByPaperId(data) {
            // Create an object to store the grouped data
            const groups = {};
            // Iterate over each item in the data array
            data.forEach((item) => {
                const { paperId, ...rest } = item;
                // Check if the paperId already exists as a key in the groups object
                if (groups.hasOwnProperty(paperId)) {
                    // If the paperId exists, push the rest of the item into the subtopics array of the corresponding group
                    groups[paperId].push({ ...rest });
                } else {
                    // If the paperId does not exist, create a new group with the paperId and the rest of the item
                    groups[paperId] = [{ ...rest}];
                }
            });

            return groups;
        }

        const combinedPapers = groupByPaperId(combinedTopics)
        return combinedPapers;
    } catch (error) {
        console.error('Error fetching topics:', error);
        return [];
    }
};


// Main function to fetch all data and store as JSON
const fetchData = async () => {
    try {
        const papersData = await fetchTopics();
        const data =papersData;
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync('metadata.json', jsonData);
        console.log('MetaData fetched and stored as metadata.json');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// Run the script
fetchData();
