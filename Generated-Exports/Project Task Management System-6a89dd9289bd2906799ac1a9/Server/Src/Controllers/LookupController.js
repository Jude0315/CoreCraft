

const User =
  require(
    "../Models/User"
  );

const Project =
  require(
    "../Models/Project"
  );



const GetProjectManagerLookup =
  async (req, res) => {
    try {
      const filter =
        {
        ["role"]:
          "project manager"
      };

      const records =
        await User
          .find(filter)
          .select(
            "_id name"
          )
          .lean();

      const items =
        records.map(
          (record) => ({
            _id:
              record._id,

            label:
              [
                record["name"]
              ]
                .filter(
                  (value) =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                )
                .map(
                  (value) =>
                    String(value)
                )
                .join(" - ") ||
              String(
                record._id
              ),
          })
        );

      return res.json(items);

    } catch (error) {

      return res.status(500).json({
        message:
          error.message,
      });

    }
  };


const GetTaskProjectLookup =
  async (req, res) => {
    try {
      const filter =
        {};

      const records =
        await Project
          .find(filter)
          .select(
            "_id title"
          )
          .lean();

      const items =
        records.map(
          (record) => ({
            _id:
              record._id,

            label:
              [
                record["title"]
              ]
                .filter(
                  (value) =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                )
                .map(
                  (value) =>
                    String(value)
                )
                .join(" - ") ||
              String(
                record._id
              ),
          })
        );

      return res.json(items);

    } catch (error) {

      return res.status(500).json({
        message:
          error.message,
      });

    }
  };


const GetTaskAssignedToLookup =
  async (req, res) => {
    try {
      const filter =
        {
        ["role"]:
          "team member"
      };

      const records =
        await User
          .find(filter)
          .select(
            "_id name"
          )
          .lean();

      const items =
        records.map(
          (record) => ({
            _id:
              record._id,

            label:
              [
                record["name"]
              ]
                .filter(
                  (value) =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                )
                .map(
                  (value) =>
                    String(value)
                )
                .join(" - ") ||
              String(
                record._id
              ),
          })
        );

      return res.json(items);

    } catch (error) {

      return res.status(500).json({
        message:
          error.message,
      });

    }
  };



module.exports = {
  GetProjectManagerLookup,
  GetTaskProjectLookup,
  GetTaskAssignedToLookup
};
