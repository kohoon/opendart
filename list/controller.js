// list/controller.js
const axios = require("axios");

exports.getList = async (req, res) => {
    const response = await axios.get("https://opendart.fss.or.kr/api/list.json", {
        params: {
            // ... your parameters
        },
    });
    // ... process the response
    res.json(response.data);
};
