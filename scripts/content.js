const insert = (content) => {
    const element = document.getElementById('main');
    console.log(`# of children in div: ${element.childNodes.length}`);

    const pToRemove = element.childNodes[0];
    pToRemove.remove();

    const splitContent = content.split('\n');
    splitContent.forEach((content) => {
        console.log(`Processing content ${content}`);
        const p = document.createElement('p');

        if (content === '') {
            const br = document.createElement('br');
            p.appendChild(br);
        } else {
            p.textContent = content;
        }

        element.appendChild(p);
    });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'inject') {
        const { content } = request;
        console.log(`Received inject message with the following content ${content}`);

        result = insert(content)
        if (!result) {
            sendResponse({ status: 'failed'});
        }

        sendResponse({ status: 'success' });
        console.log("Finished responding to inject message...");
    }
});