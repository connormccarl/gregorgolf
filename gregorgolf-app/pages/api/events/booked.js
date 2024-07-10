import { apiHandler, eventsRepo } from 'helpers/api';

export default apiHandler({
    get: isBookedInOtherBay,
});

/* TESTING
    id: 6660a22b0644eae523445033
    bay: 1
    time: "2024-07-09T07:00:00.000Z"

*/

async function isBookedInOtherBay(req, res) {
    const userId = req.query.user;
    const bay = req.query.bay;
    const time = req.query.time;

    const isFound = await eventsRepo.isBookedInOtherBay(userId, bay, time);

    //console.log(isFound);

    return res.status(200).json({ isFound });
}