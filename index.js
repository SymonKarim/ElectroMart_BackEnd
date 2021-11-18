const PORT = process.env.PORT || 5000;
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
app.use(express.json());

app.use(cors());

const uri =
  "mongodb+srv://symon:wi1T6bouYf5pyztH@cluster0.qpt6d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("ecommerce");
    const productItems = database.collection("productItems");
    const orders = database.collection("orders");
    const reviews = database.collection("reviews");
    const userList = database.collection("users");

    app.post("/add_new_item", async (req, res) => {
      const newItem = req.body;
      try {
        const savedItem = await productItems.insertOne(newItem);
        res.status(200).json(savedItem);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.get("/all_items", async (req, res) => {
      try {
        const allItems = await productItems.find().toArray();
        res.status(200).json(allItems);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.get("/product/:id", async (req, res) => {
      const productId = req.params.id;
      try {
        const product = await productItems.findOne({
          _id: new ObjectId(productId),
        });
        res.status(200).json(product);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.post("/create_order/:id", async (req, res) => {
      const productId = req.params.id;
      const newItem = { productId, ...req.body };
      try {
        const savedItem = await orders.insertOne(newItem);
        res.status(200).json(savedItem);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.get("/all_orders", async (req, res) => {
      try {
        const allItems = await orders.find().toArray();
        res.status(200).json(allItems);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.put("/updateStatus/:id", async (req, res) => {
      const orderId = req.params.id;
      try {
        const order = await orders.updateOne(
          { _id: orderId },
          { $set: { status: "Approved" } }
        );
        res.status(200).json(order);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });

    app.delete("/delete_order/:id", async (req, res) => {
      const orderId = req.params.id;
      try {
        const order = await orders.deleteOne({ _id: orderId });
        res.status(200).json(order);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });
    app.get("/dashboard_data", async (req, res) => {
      const AllProducts = await productItems.find().toArray();
      const AllOrders = await orders.find().toArray();
      res.json({ products: AllProducts.length, orders: AllOrders.length });
    });
    app.post("/reviews", async (req, res) => {
      const { rating, comment, name } = req.body;
      const SingleReview = await reviews.insertOne({ rating, comment, name });
      res.json(SingleReview);
    });
    app.post("/users", async (req, res) => {
      const { name, email, password, isAdmin } = req.body;
      const SingleUser = await userList.insertOne({
        name,
        email,
        password,
        isAdmin,
      });
      res.json(SingleUser);
    });
    app.get("/getreviews", async (req, res) => {
      const allReviews = await reviews.find().toArray();

      res.status(200).json(allReviews);
    });
    app.get("/getusers", async (req, res) => {
      const allUser = await userList.find().toArray();
      res.json(allUser);
    });
    app.get("/getuser/:email", async (req, res) => {
      const email = req.params.email;
      const userbyEmail = await userList.findOne({ email });

      res.json(userbyEmail);
    });
    app.put("/makeadmin/:email", async (req, res) => {
      const email = req.params.email;
      try {
        const user = await userList.updateOne(
          { email },
          { $set: { isAdmin: true } }
        );
        res.json(user);
      } catch (error) {
        res.status(400).json(error.message);
      }
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);
app.listen(PORT, () => console.log(`Listen on PORT: ${PORT}`));
app.get("/", async (req, res) => {
  res.send("running from server");
});

