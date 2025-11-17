import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "../firebase.js";

function Treatments() {
  const [treatmentData, setTreatmentData] = useState({
    name: "",
    cost: "",
    description: "",
  });
  const [treatments, setTreatments] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTreatmentId, setCurrentTreatmentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch treatments
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "treatments"));
        const treatmentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTreatments(treatmentsList);
        setFilteredTreatments(treatmentsList);
      } catch (error) {
        console.error("Error fetching treatments: ", error);
      }
    };

    fetchTreatments();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setIsEditing(false);
    setTreatmentData({
      name: "",
      cost: "",
      description: "",
    });
    setCurrentTreatmentId(null);
  };

  const handleShow = () => setShowModal(true);

  // Handle add/edit treatment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && currentTreatmentId) {
        await updateDoc(
          doc(db, "treatments", currentTreatmentId),
          treatmentData
        );
        Swal.fire(
          "Success!",
          "The treatment was updated successfully.",
          "success"
        );
      } else {
        const docRef = await addDoc(
          collection(db, "treatments"),
          treatmentData
        );
        console.log("Document written with ID: ", docRef.id);
        Swal.fire(
          "Success!",
          "The treatment was added successfully.",
          "success"
        );
      }
      handleClose();
      const querySnapshot = await getDocs(collection(db, "treatments"));
      const treatmentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTreatments(treatmentsList);
      setFilteredTreatments(treatmentsList);
    } catch (e) {
      console.error("Error adding/editing document: ", e);
    }
  };

  // Handle delete treatment
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "treatments", id));
        console.log("Document successfully deleted");
        const querySnapshot = await getDocs(collection(db, "treatments"));
        const treatmentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTreatments(treatmentsList);
        setFilteredTreatments(treatmentsList);
        Swal.fire("Deleted!", "The treatment has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting document: ", error);
        Swal.fire(
          "Error!",
          "There was an error deleting the treatment.",
          "error"
        );
      }
    }
  };

  const handleEdit = (treatment) => {
    setIsEditing(true);
    setCurrentTreatmentId(treatment.id);
    setTreatmentData(treatment);
    setShowModal(true);
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filteredList = treatments.filter((treatment) =>
      treatment.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredTreatments(filteredList);
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-12 d-flex align-items-center">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search Treatment"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: "auto", flexGrow: 1 }}
          />
          <button className="btn btn-dark w-auto" onClick={handleShow}>
            Add Treatment
          </button>
        </div>
      </div>
      <div className="table-container">
        <table className="table table-responsive caption-top ">
          <caption>TREATMENTS</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Cost</th>
              <th scope="col">Description</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTreatments.map((treatment) => (
              <tr key={treatment.id}>
                <td>{treatment.name}</td>
                <td>
                  ₱
                  {treatment.cost
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </td>
                <td>{treatment.description}</td>

                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(treatment.id)}
                  >
                    <i className="bi bi-trash bi-danger"></i>
                  </button>{" "}
                  &nbsp;
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleEdit(treatment)}
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ display: showModal ? "block" : "none" }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEditing ? "Edit Treatment" : "Add New Treatment"}
              </h5>
              <button
                type="button"
                className="close"
                onClick={handleClose}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Treatment Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Treatment Name"
                    value={treatmentData.name}
                    onChange={(e) =>
                      setTreatmentData({
                        ...treatmentData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Treatment Cost</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter Treatment Cost"
                    value={treatmentData.cost}
                    onChange={(e) =>
                      setTreatmentData({
                        ...treatmentData,
                        cost: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Treatment Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Treatment Description"
                    value={treatmentData.description}
                    onChange={(e) =>
                      setTreatmentData({
                        ...treatmentData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                {isEditing ? "Update Treatment" : "Save Treatment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Treatments;
