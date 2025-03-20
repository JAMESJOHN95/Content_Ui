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
//react icons for image icon, file icon and text icon
import { FaImage } from "react-icons/fa6";
import { IoLinkOutline } from "react-icons/io5";
import { RxText } from "react-icons/rx";
import { FaCode } from "react-icons/fa6";
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Heading.configure({ levels: [1, 2] }),
      Bold,
      Italic,
      Underline,
      Strike,
      ListItem,
      BulletList,
      OrderedList,
      History,
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
    }

    if (type === "image") {
      document.getElementById("imageUpload").click();
    } else if (type === "code") {
      //open code input modal
      setShowCodeModal(true);
    } else {
      let content = "";
      if (type === "text") {
        content = prompt("Enter your text:", "Sample Text") || "Sample Text";
      } else if (type === "link") {
        content =
          prompt("Enter URL:", "https://example.com") || "https://example.com";
      } else if (type === "code") {
        content = `\n<pre><code>${prompt(
          "Enter your code:",
          "console.log('Hello World');"
        )}</code></pre>\n`;
      } else {
        content = type;
      }
      setDroppedContent((prev) => prev + "\n" + content);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDroppedContent(
          (prev) =>
            prev + `\n<img src="${e.target.result}" alt="Uploaded Image" />\n`
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCode = () => {
    if (codeInput.trim()) {
      setDroppedContent(
        (prev) => prev + `\n<pre><code>${codeInput}</code></pre>\n`
      );
    }
    setShowCodeModal(false);
    setCodeInput("");
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        {/* <div className="col-md-2 p-0">
          <Layout />
        </div> */}

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
                    onDragStart={(e) => handleDragStart(e, "")}
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

              {/* Subject */}
              {/*  <div className="mb-4">
                <label className="form-label fw-semibold">
                  Subject <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Subject..."
                />
              </div> */}
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

              {/* Visible for Everyone */}
              {/*   <div className="mb-4">
                <label className="form-label fw-semibold">
                  Visible for everyone?
                </label>
                <select className="form-select">
                  <option value="">Select</option>
                </select>
              </div> */}
            </div>
          </div>
          <label className=" fw-semibold">Template Body</label>
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
                    <i class="fa-solid fa-b "></i>
                  </b>
                </button>
                <button
                  className="btn"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <i class="fa-solid fa-i fa-italic"></i>
                </button>
                <button
                  className="btn"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                  <i class="fa-solid fa-underline"></i>
                </button>
                <button
                  className="btn"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                  <i class="fa-solid fa-strikethrough"></i>
                </button>
                <button
                  className="btn"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                >
                  <i class="fa-solid fa-list-ul"></i>
                </button>
                <button
                  className="btn"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                >
                  <i class="fa-solid fa-list-ol"></i>
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
                  <i class="fa-solid fa-link"></i>
                </button>
                <button className="btn" onClick={() => setDroppedContent("")}>
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            )}

            {/* TipTap Editor */}
            <div className="mb-3">
              <div
                className="border p-4"
                style={{ minHeight: "300px" }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {columns.length > 0 &&
                  columns.map((column) => (
                    <div
                      key={column.id}
                      className="border p-3 mb-3 bg-light w-100 d-flex gap-2"
                    >
                      {column.structure.map((block) => (
                        <div
                          key={block.id}
                          className="border p-2 bg-white flex-grow-1"
                          style={{ width: "50%" }}
                        >
                          <input
                            type="text"
                            className="form-control"
                            value={block.content}
                            onChange={(e) => {
                              setColumns((prevColumns) =>
                                prevColumns.map((col) =>
                                  col.id === column.id
                                    ? {
                                        ...col,
                                        structure: col.structure.map((b) =>
                                          b.id === block.id
                                            ? { ...b, content: e.target.value }
                                            : b
                                        ),
                                      }
                                    : col
                                )
                              );
                            }}
                            placeholder="Drop content here"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
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
            <div className="modal-overlay">
              <div className="modal-content">
                <h5>Enter Code</h5>
                <textarea
                  className="form-control"
                  rows="5"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
                <button
                  className="btn btn-primary mt-2"
                  onClick={handleSaveCode}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary mt-2"
                  onClick={() => setShowCodeModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewTemplate;
