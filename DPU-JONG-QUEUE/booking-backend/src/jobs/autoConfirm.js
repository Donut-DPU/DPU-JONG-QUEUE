import cron from 'node-cron'
import { Op } from 'sequelize'
import Booking from '../models/Booking.js'
import Service from '../models/Service.js'

cron.schedule('* * * * *', async () => {

  const bookings = await Booking.findAll({
    where: {
      status: 'pending'
    },
    include: [Service]
  })

  const now = new Date()

  for (const b of bookings) {

    const service = b.Service

    if (!service?.autoConfirmEnabled) continue

    const created = new Date(b.createdAt)

    const diffMin =
      (now - created) / 1000 / 60

    if (diffMin >= service.autoConfirmMinutes) {

      b.status = 'confirmed'

      await b.save()

      console.log(
        `✅ Auto confirmed booking ${b.id}`
      )
    }
  }

})