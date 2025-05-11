
// Import packages - NOTE: set "type": "module" in package.json to do this!!
import express from 'express'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Set up middleware
dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

// init Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

// Set location for static files
app.use(express.static('public'))

// Call to fetch exercises from DB
app.get('/exercises', async (req, res) => {

    // Get form elements from query with destructuring, else empty array
    const { level = [], equipment = [], primaryMuscles = [], category = [] } = req.query

    // Make sure everything is an array (singletons are passed as strings from frontend)
    const levels = Array.isArray(level) ? level : [level]
    const equips = Array.isArray(equipment) ? equipment : [equipment]
    const muscles = Array.isArray(primaryMuscles) ? primaryMuscles : [primaryMuscles]
    const cats = Array.isArray(category) ? category : [category]

    // Start query SQL: "select id, name, level, equipment, primaryMuscles, category from exercises"
    let query = supabase
        .from('exercises')
        .select('id, name, level, equipment, primaryMuscles, category') // selecting the ID to store it in the anchor tag

    // If not none and not all levels selected, then "where level in (<levels>)"
    if (levels.length > 0 && levels.length < 3) {
        query = query.in('level', levels)
    }

    // If Body Only selected, then "where equipment in ('Body Only'), else "where equipment <> ('Body Only')"
    const wantsBodyOnly = equips.includes('Body Only')
    const wantsEquipReq = equips.includes('Equipment Required')
    if (wantsBodyOnly && !wantsEquipReq) {
        query = query.eq('equipment', 'Body Only')
    } else if (wantsEquipReq && !wantsBodyOnly) {
        query = query.neq('equipment', 'Body Only')
    }

    // If not none and not all muscles selected, then "where primaryMuscles in (<muscles>)"
    if (muscles.length > 0 && muscles.length < 17) {
        query = query.in('primaryMuscles', muscles)
    }

    // If not none and not all categories selected, then "where category in (<categories>)"
    if (cats.length > 0 && cats.length < 7) {
        query = query.in('category', cats)
    }

    // Execute query and await result
    const { data, error } = await query
    if (error) {
        console.error('Supabase error:', error)
        return res.status(500).json({ error: error.message })
    }

    // Send data as response
    res.json(data)
})

// Fetch as single exercise base on its ID (passed from frontend)
app.get('/exercises/:id', async (req, res) => {
    const { id } = req.params

    // select TOP 1 * from exercises where id = <id>
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single() //redundant, but makes sure we only return one exercise

    if (error) {
        console.error('Error fetching exercise:', error)
        return res.status(500).json({ error: error.message })
    }

    // Send data as resposne
    res.json(data)
})

// init server on specified port
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
