import React, { useState } from "react";
import Layout from "./Layout";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { FaImage } from "react-icons/fa6";
import { IoLinkOutline } from "react-icons/io5";
import { RxText } from "react-icons/rx";
import { FaCode } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { IoInformationCircleOutline } from "react-icons/io5";
import { v4 as uuidv4 } from "uuid";

function NewTemplate() {
  const [templateBody, setTemplateBody] = useState("");
  const [showStructures, setShowStructures] = useState(false);
  const [droppedContent, setDroppedContent] = useState("");
  const [showContents, setShowContents] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [columns, setColumns] = useState([]);
  const [currentDropTarget, setCurrentDropTarget] = useState(null);
  //state to track content dropped directly into the container
  const [containerContent, setContainerContent] = useState([]);
  //state to track active image upload
  const [activeImageUpload, setActiveImageUpload] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit, // Already includes History
      Link,
      Heading.configure({ levels: [1, 2] }),
      Bold,
      Italic,
      Underline,
      Strike,
      ListItem,
      BulletList,
      OrderedList,
    ],
    content: templateBody,
    onUpdate: ({ editor }) => {
      setTemplateBody(editor.getHTML());
    },
  });

  const handleDragStart = (event, type) => {
    event.dataTransfer.setData("text/plain", type);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("text");
    if (!type) return;

    if (type === "1:1 column") {
      const newColumn = {
        id: uuidv4(),
        type,
        structure: [
          { id: uuidv4(), content: "" }, // First div
          { id: uuidv4(), content: "" }, // Second div
        ],
      };

      setColumns((prevColumns) => [...prevColumns, newColumn]);
    } else {
      // For other content types
      handleDirectContainerDrop(type, event);
    }
  };

  // Function to add content to the container
  const addContentToContainer = (type, content) => {
    const newContent = {
      id: uuidv4(),
      type,
      content,
    };

    setContainerContent((prev) => [...prev, newContent]);
  };

  //function to handle direct drops into the container
  const handleDirectContainerDrop = (type, event) => {
    // Only process if we're not dropping into a column input
    if (!currentDropTarget) {
      if (type === "image") {
        document.getElementById("imageUpload").click();
        // Set a flag to indicate the upload is for the container
        setCurrentDropTarget({ isContainer: true });
      } else if (type === "code") {
        setShowCodeModal(true);
        // Set a flag to indicate the code is for the container
        setCurrentDropTarget({ isContainer: true });
      } else {
        let content = "";
        let contentType = type;

        if (type === "text") {
          content = prompt("Enter your text:", "Sample Text") || "Sample Text";
        } else if (type === "link") {
          content =
            prompt("Enter URL:", "https://example.com") ||
            "https://example.com";
        } else {
          content = type;
        }

        // Add the content directly to the container
        addContentToContainer(contentType, content);
      }
    } else {
      // This is a drop on a column input, use the existing handler
      handleContentDrop(type);
    }
  };

  const handleContentDrop = (type) => {
    if (type === "image") {
      document.getElementById("imageUpload").click();
    } else if (type === "code") {
      setShowCodeModal(true);
    } else {
      let content = "";
      if (type === "text") {
        content = prompt("Enter your text:", "Sample Text") || "Sample Text";
      } else if (type === "link") {
        content =
          prompt("Enter URL:", "https://example.com") || "https://example.com";
      } else {
        content = type;
      }

      // Check if we have a current drop target
      if (currentDropTarget) {
        // Update the specific column's input
        updateColumnContent(
          currentDropTarget.columnId,
          currentDropTarget.blockId,
          content
        );
        setCurrentDropTarget(null); // Reset the drop target after updating
      } else {
        // Add content directly to editor if no specific target
        if (editor) {
          editor.commands.insertContent(content);
        }
        // Also update droppedContent state for tracking
        setDroppedContent((prev) => prev + "\n" + content);
      }
    }
  };

  const handleInputDragOver = (e, columnId, blockId) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentDropTarget({ columnId, blockId });
  };

  const handleInputDragLeave = () => {
    setCurrentDropTarget(null);
  };

  const handleInputDrop = (e, columnId, blockId) => {
    e.preventDefault();
    e.stopPropagation();

    const type = e.dataTransfer.getData("text");
    if (!type) return;

    if (type === "image") {
      // Save target info before clicking to upload
      setCurrentDropTarget({ columnId, blockId });
      document.getElementById("imageUpload").click();
    } else if (type === "code") {
      // Save target info before opening modal
      setCurrentDropTarget({ columnId, blockId });
      setShowCodeModal(true);
    } else {
      let content = "";
      if (type === "text") {
        content = prompt("Enter your text:", "Sample Text") || "Sample Text";
      } else if (type === "link") {
        content =
          prompt("Enter URL:", "https://example.com") || "https://example.com";
      } else {
        content = type;
      }

      updateColumnContent(columnId, blockId, content);
    }
  };

  const updateColumnContent = (columnId, blockId, content) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              structure: col.structure.map((block) =>
                block.id === blockId ? { ...block, content: content } : block
              ),
            }
          : col
      )
    );
  };

  // Updated handleImageUpload function
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageContent = `Image: ${file.name}`;

        if (currentDropTarget) {
          if (currentDropTarget.isContainer) {
            // For container
            addContentToContainer("image", imageContent);
          } else {
            // For column input
            updateColumnContent(
              currentDropTarget.columnId,
              currentDropTarget.blockId,
              imageContent
            );
          }
          setCurrentDropTarget(null); // Reset after updating
        } else {
          // Default case - add to the container
          addContentToContainer("image", imageContent);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Updated handleSaveCode function
  const handleSaveCode = () => {
    if (codeInput.trim()) {
      const codeContent = `Code: ${codeInput.substring(0, 20)}...`;

      if (currentDropTarget) {
        if (currentDropTarget.isContainer) {
          // For container
          addContentToContainer("code", codeContent);
        } else {
          // For column input
          updateColumnContent(
            currentDropTarget.columnId,
            currentDropTarget.blockId,
            codeContent
          );
        }
        setCurrentDropTarget(null); // Reset after updating
      } else {
        // Default case - add to the container
        addContentToContainer("code", codeContent);
      }
    }
    setShowCodeModal(false);
    setCodeInput("");
  };

  const clearInputContent = (columnId, blockId) => {
    updateColumnContent(columnId, blockId, "");
  };

  const clearContent = () => {
    setDroppedContent("");
    if (editor) {
      editor.commands.setContent("");
    }
  };

  // Function to clear container content
  const clearContainerContent = () => {
    setContainerContent([]);
  };

  // Function to remove a specific content item from the container
  const removeContainerItem = (id) => {
    setContainerContent((prev) => prev.filter((item) => item.id !== id));
  };

  // Function to remove a specific column
  const removeColumn = (columnId) => {
    setColumns((prevColumns) =>
      prevColumns.filter((col) => col.id !== columnId)
    );
  };

  // Updated clearAllContent function to clear all content types
  const clearAllContent = () => {
    // Clear the editor content
    if (editor) {
      editor.commands.setContent("");
    }

    // Clear the container content
    setContainerContent([]);

    // Clear the columns
    setColumns([]);

    // Clear the dropped content tracking
    setDroppedContent("");
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Structure for columns */}
        <div className="col-md-2 p-2 text-center border-end">
          <div className="d-flex flex-column justify-content-between align-items-center p-2 mb-2">
            {/* Dropdown  for selecting structure */}
            <button
              style={{
                cursor: "pointer",
                backgroundColor: "white",
                border: "1px solid #333",
              }}
              onClick={() => setShowStructures(!showStructures)}
              className="btn w-100 mb-3"
            >
              Structures
            </button>
            {showStructures && (
              <ul className="list-unstyled w-100">
                <li
                  className="p-3 border border-dark rounded mb-2 bg-white text-center fw-bold w-100"
                  draggable
                  onDragStart={(e) => handleDragStart(e, "1:1 column")}
                  style={{ cursor: "grab" }}
                >
                  1:1 Column
                </li>
              </ul>
            )}
            <div className="p-0 w-100">
              {/* Dropdown for selecting content */}
              <button
                style={{
                  cursor: "pointer",
                  backgroundColor: "white",
                  border: "1px solid #333",
                }}
                onClick={() => setShowContents(!showContents)}
                className="btn w-100 mb-3"
              >
                Contents
              </button>
              {showContents && (
                <ul className="list-unstyled ">
                  <li
                    className="p-3 border border-dark rounded mb-2 bg-white text-center fw-bold w-100"
                    draggable
                    onDragStart={(e) => handleDragStart(e, "text")}
                    style={{ cursor: "grab" }}
                  >
                    <RxText /> Text
                  </li>
                  <li
                    className="p-3 border rounded mb-2 bg-white text-center fw-bold w-100"
                    draggable
                    onDragStart={(e) => handleDragStart(e, "image")}
                    style={{ cursor: "grab" }}
                  >
                    <FaImage /> Image
                  </li>
                  <li
                    className="p-3 border rounded mb-2 bg-white text-center fw-bold w-100"
                    draggable
                    onDragStart={(e) => handleDragStart(e, "link")}
                    style={{ cursor: "grab" }}
                  >
                    <IoLinkOutline /> Link
                  </li>
                  <li
                    className="p-3 border rounded mb-2 bg-white text-center fw-bold w-100"
                    draggable
                    onDragStart={(e) => handleDragStart(e, "code")}
                    style={{ cursor: "grab" }}
                  >
                    <FaCode /> Code
                  </li>
                </ul>
              )}
              <input
                type="file"
                id="imageUpload"
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="col-md-10 mt-4">
          <h2 className="fw-bold mb-4">Create Template</h2>

          <div className="row">
            {/* Left Side (Category, Subject) */}
            <div className="col-md-6">
              {/* Category */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Category <span className="text-danger">*</span>
                </label>
                <select className="form-select">
                  <option value="" disabled>
                    Category...
                  </option>
                  <option value="">SD</option>
                  <option value="">QWP</option>
                </select>
              </div>
            </div>

            {/* Right Side (Template Name, Visibility) */}
            <div className="col-md-6">
              {/* Template Name */}
              <div className="mb-0">
                <label className="form-label fw-semibold">
                  Template Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Template Name..."
                />
                <small className="text-secondary">
                  It has to be unique. Accepts only Alphanumeric, Underscores,
                  and Hyphens.
                </small>
              </div>
            </div>
          </div>
          <label className="fw-semibold">Template Body</label>
          {/* Template Body Section */}
          <div className="mb-4 border">
            {/* Toolbar */}
            {editor && (
              <div
                className="editor-toolbar p-1 border"
                style={{ backgroundColor: "lightgrey" }}
              >
                <button
                  className="btn"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <b>
                    <i className="fa-solid fa-b "></i>
                  </b>
                </button>
                <button
                  className="btn"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <i className="fa-solid fa-i fa-italic"></i>
                </button>
                <button
                  className="btn"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                  <i className="fa-solid fa-underline"></i>
                </button>
                <button
                  className="btn"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                  <i className="fa-solid fa-strikethrough"></i>
                </button>
                <button
                  className="btn"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                >
                  <i className="fa-solid fa-list-ul"></i>
                </button>
                <button
                  className="btn"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                >
                  <i className="fa-solid fa-list-ol"></i>
                </button>
                {/* Undo */}
                <button
                  className="btn"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                >
                  <i className="fa-solid fa-rotate-left"></i>
                </button>

                {/* Redo */}
                <button
                  className="btn"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                >
                  <i className="fa-solid fa-rotate-right"></i>
                </button>

                {/* Justify Left */}
                <button
                  className="btn"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                >
                  <i className="fa-solid fa-align-left"></i>
                </button>

                {/* Justify Center */}
                <button
                  className="btn"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                  }
                >
                  <i className="fa-solid fa-align-center"></i>
                </button>

                {/* Justify Right */}
                <button
                  className="btn"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                  }
                >
                  <i className="fa-solid fa-align-right"></i>
                </button>

                <button
                  className="btn"
                  onClick={() => {
                    const url = prompt("Enter URL");
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                >
                  <i className="fa-solid fa-link"></i>
                </button>
                <button className="btn" onClick={clearAllContent}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            )}

            <div className="mb-3">
              <div
                className="border p-4 position-relative"
                style={{ minHeight: "300px" }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Render direct container content */}
                {containerContent.map((item) => (
                  <div
                    key={item.id}
                    className="mb-2 p-2 border rounded position-relative"
                    style={{
                      backgroundColor:
                        item.type === "text"
                          ? "#f8f9fa"
                          : item.type === "image"
                          ? "#e7f5ff"
                          : item.type === "link"
                          ? "#fff9db"
                          : item.type === "code"
                          ? "#f8f9fa"
                          : "#ffffff",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        {item.type === "image" && (
                          <div className="d-flex align-items-center">
                            <FaImage className="me-2" /> {item.content}
                          </div>
                        )}
                        {item.type === "link" && (
                          <div className="d-flex align-items-center">
                            <IoLinkOutline className="me-2" />
                            <a
                              href={item.content}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.content}
                            </a>
                          </div>
                        )}
                        {item.type === "text" && (
                          <div>
                            <RxText className="me-2" /> {item.content}
                          </div>
                        )}
                        {item.type === "code" && (
                          <div className="d-flex align-items-center">
                            <FaCode className="me-2" /> {item.content}
                          </div>
                        )}
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeContainerItem(item.id)}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Render columns */}
                {columns.length > 0 &&
                  columns.map((column) => (
                    <div
                      key={column.id}
                      className="border p-3 mb-3 bg-light w-100"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold">1:1 Column</span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeColumn(column.id)}
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                      <div className="d-flex gap-2">
                        {column.structure.map((block) => (
                          <div
                            key={block.id}
                            className="border p-2 bg-white flex-grow-1 position-relative"
                            style={{ width: "50%" }}
                          >
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                value={block.content}
                                onChange={(e) => {
                                  updateColumnContent(
                                    column.id,
                                    block.id,
                                    e.target.value
                                  );
                                }}
                                placeholder="Drop content here"
                                onDragOver={(e) =>
                                  handleInputDragOver(e, column.id, block.id)
                                }
                                onDragLeave={handleInputDragLeave}
                                onDrop={(e) =>
                                  handleInputDrop(e, column.id, block.id)
                                }
                              />
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() =>
                                  clearInputContent(column.id, block.id)
                                }
                              >
                                <i className="fa-solid fa-times"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                {/* Show placeholder text when empty */}
                {containerContent.length === 0 && columns.length === 0 && (
                  <div className="text-center text-muted py-5">
                    <p>Drag and drop content or structures here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Attributes */}
          <div className="mb-2 border p-3">
            <strong>Available Attributes:</strong>
            <p>
              First Name:{" "}
              <code style={{ color: "black" }}>{"{{FirstName}}"}</code>
              <br />
              Last Name:{" "}
              <code style={{ color: "black" }}>{"{{LastName}}"}</code>
              <br />
              Email: <code style={{ color: "black" }}>{"{{Email}}"}</code>
            </p>

            <small className="text-muted">
              Attributes are case-sensitive. Mail couldn't send with invalid
              attributes.
            </small>
          </div>

          <div className="row p-2 d-flex justify-content-center align-items-center">
            <div className="col-md-10 p-2">
              {" "}
              <label htmlFor="uploadImage" className="form-control w-100 p-3 ">
                <input
                  type="file"
                  id="uploadImage" /* style={{display:'none'}} */
                />
                {/* <img src="https://appflowy.com/_next/static/media/upload-cloud.8e4f70a0.png" alt="no image"/> */}
              </label>
            </div>
            <div className="col-md-2 text-end">
              <button
                className="btn px-5 py-3 mt-2"
                style={{ backgroundColor: "black", color: "white" }}
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* Code Input Modal */}
          {showCodeModal && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1050,
              }}
            >
              <div className="bg-white p-4 rounded" style={{ width: "50%" }}>
                <h5>Enter Code</h5>
                <textarea
                  className="form-control"
                  rows="5"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCodeModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveCode}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewTemplate;