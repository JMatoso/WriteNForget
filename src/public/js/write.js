(() => {
    'use strict'

    ClassicEditor
        .create(document.querySelector('#editor'), {
            placeholder: 'Write your thoughts here',
            fontSize: {
                options: [ 10, 12, 14, 'default', 18, 20, 22 ],
                supportAllValues: true
            },
        })
        .catch(error => {
            console.error(error);
        })

    initAutoCompleteElement()
})()

function initAutoCompleteElement() {
    const autoCompleteJS = new autoComplete({
            selector: `#autoComplete`,
            data: {
                src: async (query) => {
                    try {
                        const source = await fetch(`/fetch-categories`)
                        return await source.json()
                    } catch (error) { return error }
                }, 
                cache: true,
            },
            resultItem: {
                diacritics: false,
                highlight: true,
            },
            events: {
                input: {
                    selection: (event) => {
                        const selection = event.detail.selection.value;
                        autoCompleteJS.input.value = selection;
                    }
                }
            }
        });
}