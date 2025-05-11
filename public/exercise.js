
// Call this anonymous function immediately upon page load
(async () => {
    // Get the encoded ID value from the clicked link
    const params = new URLSearchParams(window.location.search)
    //console.log('params: ' + params)
    const id = params.get('id')
    //console.log("client-side ID: " + id)
    const container = document.getElementById('details')

    if (!id) {
        container.textContent = 'No exercise specified.'
        return
    }

    // Try to get the exercis details from the server
    try {
        const res = await fetch(`/exercises/${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const ex = await res.json()

        // Secondary muscles are delimited with | symbols, replace with comma and space
        const secondary = ex.secondaryMuscles ? ex.secondaryMuscles.split('|').join(', ') : ''

        // Same with exercise steps
        const steps = ex.instructions ? ex.instructions.split('|') : []

        // Construct image URLs so we don't have to host them ourself
        const base = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
        const img0 = ex.image0 ? `<img src="${base}${ex.image0}" alt="${ex.name} image 1" style="max-width:300px;margin-right:1rem;">` : ''
        const img1 = ex.image1 ? `<img src="${base}${ex.image1}" alt="${ex.name} image 2" style="max-width:300px;">` : ''

        // List other details
        container.innerHTML = `
        <h1>${ex.name}</h1>
        <p><strong>Force:</strong> ${ex.force}</p>
        <p><strong>Level:</strong> ${ex.level}</p>
        <p><strong>Mechanic:</strong> ${ex.mechanic}</p>
        <p><strong>Equipment:</strong> ${ex.equipment}</p>
        <p><strong>Primary Muscle:</strong> ${ex.primaryMuscles}</p>
        <p><strong>Secondary Muscles:</strong> ${secondary}</p>
        <p><strong>Category:</strong> ${ex.category}</p>
  
        <h2>Instructions</h2>
        <!-- Put exercise steps in an ordered list (with numbers) -->
        <ol>
          ${steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
  
        <h2>Images</h2>
        <div>${img0}${img1}</div>
      `
    } catch (err) {
        console.error(err)
        container.textContent = 'Failed to load exercise details.'
    }
})()
