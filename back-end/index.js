const express = require('express');
const app = express();
const cors = require('cors')

const corsOptions = {
    origin: ["http://localhost:5173"]
}

app.use(cors(corsOptions))

app.get('/', (req, res) => {
  res.json({"examplelist": [
    {   
        "id": "1",
        "title": "1",
        "imglink": "https://placehold.co/600x400"
    },
    {
        "id": "2",
        "title": "2",
        "imglink": "https://placehold.co/900x400"
    },
    {
        "id": "3",
        "title": "3",
        "imglink": "https://placehold.co/300x400"
    },
    {   
        "id": "4",
        "title": "4",
        "imglink": "https://placehold.co/600x400"
    },
    {
        "id": "5",
        "title": "5",
        "imglink": "https://placehold.co/900x400"
    },
    {
        "id": "6",
        "title": "6",
        "imglink": "https://placehold.co/300x400"
    }
  ]}) 
});

app.listen(8080, () => {
  console.log(`Server listening on port 8080`);
});