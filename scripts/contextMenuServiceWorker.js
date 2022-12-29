const basePromptPrefix = `
I want you to write me a Soviet joke based on a particular topic. Here are some examples of Sovit jokes.

-- Example 1 --
Ivanov applied to the Communist Party. The party committee conducts an interview.
"Comrade Ivanov, do you smoke?"
"Yes, I do a little."
"Do you know that comrade Lenin did not smoke and advised other communists not to smoke?"
"If comrade Lenin said so, I shall cease smoking."
"Do you drink?"
"Yes, a little."
"Comrade Lenin strongly condemned drunkenness."
"Then I shall cease drinking."
"Comrade Ivanov, what about women?"
"A little...."
"Do you know that comrade Lenin strongly condemned amoral behavior?"
"If comrade Lenin condemned, I shall not love them any longer."
"Comrade Ivanov, will you be ready to sacrifice your life for the Party?"
"Of course. Who needs such life?"
----

-- Example 2 --
Karl Marx was resurrected and came to the USSR. He was shown factories, hospitals, cities and villages, etc. Finally, he requested to be allowed to make a speech on TV. The Politburo hesitated as they were afraid he might say something they wouldn't approve. Marx promised he would say only one sentence. Under this condition, the Politburo agreed. Karl Marx uttered the following sentence: "Workers of all countries, forgive me."
----

-- Example 3 --
At a May Day parade, a very old Jew carries a slogan, "Thank you, comrade Stalin, for my happy childhood!"
The Party representative approaches the old man. "What's that? Are you deriding our Party? Everybody can see, when you were a child, comrade Stalin was not yet born!"
"That's precisely what I'm grateful to him for!" the Jew said.
----

-- Example 4 --
Two brothers, John, and Bob, who lived in America and were members of the communist party, decided to emigrate to the USSR. Even though they didn't believe the American media's negative reports on the conditions in the USSR, they decided to exercise caution. First, only John would go to Russia to test the waters. If, contrary to the media reports, the living conditions would be found good, and the reports about persecutions by the KGB false, than John would write a letter to Bob using black ink whose color would signify that the letter is to be taken at face value. If, though, the situation in the USSR happened to be bad, and John would be afraid of writing the truth, he would use red ink thus indicating that whatever he says in the letter must not be believed.
In three months John sent his first report. It was in black ink and read, "Dear brother Bob! I'm so happy here! It's a beautiful country, I enjoy complete freedom, and high standard of living. All the capitalist press wrote was lies. Everything is readily available! There is only one small thing of which there's shortage, namely red ink."
----

-- Example 5 --
A Russian, a Frenchman and an Englishman argued about Adam's nationality.
The Frenchman said, "Of course Adam was French. Look how passionately he made love to Eve!"
The Englishman said, "Of course Adam was British. Look how he gave his only apple to the lady, like a real gentleman."
The Russian said, "Of course Adam only could be Russian. Who else, possessing nothing but a sole apple, and walking with a naked ass, still believed he was in a paradise?"
----

Now, write me a Soviet joke that mimics the exmaples above as much as possible. Make sure to make fun of some USSR concepts such as Stalin, Khrushchev, Brezhnev, Gorbachev, KGB, 5 year plan, etc.

Topic: 
`;

const getKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
            if (result['openai-key']) {
                const decodedKey = atob(result['openai-key']);
                resolve(decodedKey);
            }
        })
    });
};

const sendMessage = (content) => {
    chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
        const activeTab = tabs[0].id;

        chrome.tabs.sendMessage(
            activeTab,
            { message: 'inject', content },
            (response) => {
                if (response.status === 'failed') {
                    console.log('injection failed.');
                }
            }
        );
    });
};



const generate = async (prompt) => {
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';

    const completionResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 1250,
            temperature: 0.7,
        }),
    });

    const completion = await completionResponse.json();
    return completion.choices.pop();
};

const generateCompletionAction = async (info) => {
    try {
        sendMessage('generating...');

        const { selectionText } = info;
        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);

        sendMessage(baseCompletion.text);
    } catch (error) {
        console.log(error);

        sendMessage(error.toString());
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'context-run',
        title: 'Generate Soviet joke',
        contexts: ['selection'],
    });
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);