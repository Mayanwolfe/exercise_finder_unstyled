
// Manually configure form to fetch data and format results as HTML
document.getElementById('filterForm').addEventListener('submit', async e => {
    e.preventDefault() //Stop default reload behavior
    const form = e.target
    const params = new URLSearchParams() // Configure form data as URL params (with proper formatting)

    new FormData(form).forEach((value, key) => {
        // add each form value to params list (console.log to see how it looks)
        params.append(key, value)
    })

    // Try fetching exercises from server
    try {
        // Encode the params as a URL string and fetch
        const res = await fetch('/exercises?' + params.toString())
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const exercises = await res.json() //format response as JSON

        // Set up list elements inside existing ul tag (note the encoding of the id as a URI component)
        const ul = document.getElementById('results')
        if (exercises.length === 0) {
            ul.innerHTML = '<li>No exercises found.</li>'
        } else {
            ul.innerHTML = exercises.map(exercise => {
                return `
            <li>
            <a href="exercise.html?id=${encodeURIComponent(exercise.id)}" target="_blank">
              <strong>${exercise.name}</strong><br/>
              </a>
              Level: ${exercise.level}, 
              Equipment: ${exercise.equipment ? exercise.equipment : 'none'}, 
              Primary Muscle: ${exercise.primaryMuscles}, 
              Category: ${exercise.category}
            </li>
          `
            }).join('')
        }
    } catch (err) {
        console.error('Error fetching exercises:', err)
        document.getElementById('results').innerHTML =
            '<li style="color:red">Failed to load exercises.</li>'
    }
})
