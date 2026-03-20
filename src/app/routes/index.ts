import express from 'express';
import path from 'path';
import { ExampleRoute } from '../modules/example/example.route';
import { SnidRoute } from '../modules/snid/snid.route';
import { UserRoute } from '../modules/user/user.router';
import { TransactionRoute } from '../modules/transaction/transaction.router';

import { PaymentRoute } from '../modules/payment/payment.router';
import { ServerCopyRoute } from '../modules/serverCopy/Nid.router';

const router = express.Router();

const moduleRoute = [
  {
    path: "/example",
    route: ExampleRoute
  },
  {
    path: "/snid",
    route: SnidRoute
  },
  {
    path: "/user",
    route: UserRoute
  },
  {
    path: "/transaction", // নতুন route
    route: TransactionRoute,
  },
  {
    path: "/server-copy", route: ServerCopyRoute

  },
  { path: "/payment", route: PaymentRoute },

]

moduleRoute.forEach(route => router.use(route.path, route.route))

export default router;