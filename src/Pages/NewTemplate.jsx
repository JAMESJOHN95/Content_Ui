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

    let structure = [];

    if (type === "1:1 column") {
      structure = [
        {
          id: uuidv4(),
          content: "",
        },
        {
          id: uuidv4(),
          content: "",
        },
      ];
    } else if (type === "2:1 column") {
      structure = [
        { id: uuidv4(), content: "" }, // 2 parts
        { id: uuidv4(), content: "" }, // 1 part
      ];
    } else if (type === "2:2 column") {
      structure = [
        { id: uuidv4(), content: "" },
        { id: uuidv4(), content: "" },
      ];
    } else if (type === "3:3 column") {
      structure = [
        { id: uuidv4(), content: "" },
        { id: uuidv4(), content: "" },
        { id: uuidv4(), content: "" },
      ];
    } else if (type === "4:4 column") {
      structure = [
        { id: uuidv4(), content: "" },
        { id: uuidv4(), content: "" },
        { id: uuidv4(), content: "" },
        { id: uuidv4(), content: "" },
      ];
    } else {
      // For other content types like image, text etc..
      handleDirectContainerDrop(type, event);
    }
    //handle the columns
    const newColumn = {
      id: uuidv4(),
      type,
      structure,
    };

    setColumns((prevColumns) => [...prevColumns, newColumn]);
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
      let content = "";
      let contentType = type;
      if (type === "image") {
        //Ensure only placeholder is added
        if (
          !containerContent.some((item) => item.type === "image-placeholder")
        ) {
          addContentToContainer("image-placeholder", "+ upload an image");
          setCurrentDropTarget({ isContainer: true });
        }
        return; // Stop further execution to prevent duplication
      } else if (type === "code") {
        setShowCodeModal(true);
        // Set a flag to indicate the code is for the container
        setCurrentDropTarget({ isContainer: true });
        return;
      } else if (type === "text") {
        content = prompt("Enter your text:", "Sample Text") || "Sample Text";
      } else if (type === "link") {
        content =
          prompt("Enter URL:", "https://example.com") || "https://example.com";
      } else {
        content = type;
      }
      // Prevent duplicate entries for all content types
      if (
        !containerContent.some(
          (item) => item.type === contentType && item.content === content
        )
      ) {
        addContentToContainer(contentType, content);
      }
    } else {
      handleContentDrop(type);
    }
  };

  //   const handleContentDrop = (type) => {
  //     if (!currentDropTarget) return;

  //     if (type === "image") {
  //       //for column inputs , we'll also use placeholder approach
  //       if (
  //         currentDropTarget &&
  //         currentDropTarget.columnId &&
  //         currentDropTarget.blockId
  //       ) {
  //         //update the column content
  //         updateColumnContent(
  //           currentDropTarget.columnId,
  //           currentDropTarget.blockId,
  //           "+ upload an image"
  //         );
  //         // to keep track of this target when the user clicks the + button
  //         const target = { ...currentDropTarget, isImage: true };
  //         setCurrentDropTarget(target);
  //       }
  //     } else if (type === "code") {
  //       setShowCodeModal(true);
  //     } else {
  //       let content = "";
  //       if (type === "text") {
  //         content = prompt("Enter your text:", "Sample Text") || "Sample Text";
  //       } else if (type === "link") {
  //         content =
  //           prompt("Enter URL:", "https://example.com") || "https://example.com";
  //       } else {
  //         content = type;
  //       }

  //       // Check if we have a current drop target
  //       if (
  //         currentDropTarget &&
  //         currentDropTarget.columnId &&
  //         currentDropTarget.blockId
  //       ) {
  //         // Update the specific column's input
  //         updateColumnContent(
  //           currentDropTarget.columnId,
  //           currentDropTarget.blockId,
  //           content
  //         );
  //         setCurrentDropTarget(null); // Reset the drop target after updating
  //       } else if (!currentDropTarget) {
  //         // Only insert into editor if content is NOT an image or code
  //         if (editor && type !== "image" && type !== "code" && type !== "link") {
  //           editor.commands.insertContent(content);
  //         } else {
  //         // Add content directly to editor if no specific target
  //         if (editor) {
  //           editor.commands.insertContent(content);
  //         }
  //         // Also update droppedContent state for tracking
  //         setDroppedContent((prev) => prev + "\n" + content);
  //       }
  //     }
  //   }
  // };

  const handleContentDrop = (type) => {
    if (!currentDropTarget) return;

    if (type === "image") {
      // For column inputs, use a placeholder approach
      if (currentDropTarget.columnId && currentDropTarget.blockId) {
        // Update the column content
        updateColumnContent(
          currentDropTarget.columnId,
          currentDropTarget.blockId,
          "+ upload an image"
        );
        // To keep track of this target when the user clicks the + button
        const target = { ...currentDropTarget, isImage: true };
        setCurrentDropTarget(target);
      }
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
      if (currentDropTarget.columnId && currentDropTarget.blockId) {
        // Update the specific column's input
        updateColumnContent(
          currentDropTarget.columnId,
          currentDropTarget.blockId,
          content
        );
        setCurrentDropTarget(null); // Reset the drop target after updating
      } else if (!currentDropTarget) {
        // Only insert into editor if content is NOT an image, code, or link
        if (editor && type !== "image" && type !== "code" && type !== "link") {
          editor.commands.insertContent(content);
          setDroppedContent((prev) => prev + "\n" + content);
        }
      }
    }
  };

  const handleInputDragOver = (e, columnId, blockId) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentDropTarget({ columnId, blockId });
  };

  const handleInputDragLeave = () => {
    //Only reset if not an image upload in progress
    if (!currentDropTarget || !currentDropTarget.isImage) {
      setCurrentDropTarget(null);
    }
  };

  const handleInputDrop = (e, columnId, blockId) => {
    e.preventDefault();
    e.stopPropagation();

    const type = e.dataTransfer.getData("text");
    if (!type) return;

    if (type === "image") {
      // Save target info before clicking to upload
      updateColumnContent(columnId, blockId, "+ upload an image");
      setCurrentDropTarget({ columnId, blockId, isImage: true });
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
                block.id === blockId
                  ? { ...block, content: content } // Update content only
                  : block
              ),
            }
          : col
      )
    );
  };

  // Function to handle the image placeholder click
  const handleImagePlaceholderClick = (target) => {
    setActiveImageUpload(target);
    document.getElementById("imageUpload").click();
  };

  //Function to handle the + button click for image upload
  const handleImageUploadFunciton = (target) => {
    setActiveImageUpload(target);
    document.getElementById("imageUpload").click();
  };

  // Updated handleImageUpload function
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageContent = `Image: ${file.name}`;
        if (activeImageUpload) {
          if (activeImageUpload.isContainer) {
            // For container
            removeContainerItem(activeImageUpload.itemId);
            addContentToContainer("image", imageContent);
          } else if (activeImageUpload.columnId && activeImageUpload.blockId) {
            // For column input
            updateColumnContent(
              activeImageUpload.columnId,
              activeImageUpload.blockId,
              imageContent
            );
          }
          setActiveImageUpload(null);
          setCurrentDropTarget(null);
        } else if (currentDropTarget) {
          if (currentDropTarget.isContainer) {
            // For container
            addContentToContainer("image", imageContent);
          } else if (currentDropTarget.columnId && currentDropTarget.blockId) {
            // For column input
            updateColumnContent(
              currentDropTarget.columnId,
              currentDropTarget.blockId,
              imageContent
            );
          }
          setCurrentDropTarget(null);
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

  // Helper function to render input field
  const renderInputField = (block) => {
    const isImagePlaceholder =
      block.content && block.content.includes("+ upload an image");

    return (
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          value={block.content}
          onChange={(e) => {
            const column = columns.find((col) =>
              col.structure.some((b) => b.id === block.id)
            );
            if (column) {
              updateColumnContent(column.id, block.id, e.target.value);
            }
          }}
          placeholder="Drop content here"
          onDragOver={(e) => {
            const column = columns.find((col) =>
              col.structure.some((b) => b.id === block.id)
            );
            if (column) {
              handleInputDragOver(e, column.id, block.id);
            }
          }}
          onDragLeave={handleInputDragLeave}
          onDrop={(e) => {
            const column = columns.find((col) =>
              col.structure.some((b) => b.id === block.id)
            );
            if (column) {
              handleInputDrop(e, column.id, block.id);
            }
          }}
        />
        {isImagePlaceholder ? (
          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={() => {
              const column = columns.find((col) =>
                col.structure.some((b) => b.id === block.id)
              );
              if (column) {
                handleImagePlaceholderClick({
                  columnId: column.id,
                  blockId: block.id,
                });
              }
            }}
          >
            <FaPlus />
          </button>
        ) : (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => {
              const column = columns.find((col) =>
                col.structure.some((b) => b.id === block.id)
              );
              if (column) {
                clearInputContent(column.id, block.id);
              }
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        )}
      </div>
    );
  };

  // Helper function to get column layout based on type
  const getColumnLayout = (type, blocks) => {
    if (type === "1:1 column") {
      // Two equal columns
      return (
        <div className="d-flex gap-2">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="border p-2 bg-white flex-grow-1 position-relative"
              style={{ width: "50%" }}
            >
              {renderInputField(block)}
            </div>
          ))}
        </div>
      );
    } else if (type === "2:1 column") {
      // First column takes 2/3, second takes 1/3
      return (
        <div className="d-flex gap-2">
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "66.67%" }}
          >
            {renderInputField(blocks[0])}
          </div>
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "33.33%" }}
          >
            {renderInputField(blocks[1])}
          </div>
        </div>
      );
    } else if (type === "2:2 column") {
      // Two equal columns in one row
      return (
        <div className="d-flex gap-2">
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "50%" }}
          >
            {renderInputField(blocks[0])}
          </div>
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "50%" }}
          >
            {renderInputField(blocks[1])}
          </div>
        </div>
      );
    } else if (type === "3:3 column") {
      // Three equal columns in one row
      return (
        <div className="d-flex gap-2">
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "33.33%" }}
          >
            {renderInputField(blocks[0])}
          </div>
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "33.33%" }}
          >
            {renderInputField(blocks[1])}
          </div>
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "33.33%" }}
          >
            {renderInputField(blocks[2])}
          </div>
        </div>
      );
    } else if (type === "4:4 column") {
      // Four equal columns in one row
      return (
        <div className="d-flex gap-2">
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "25%" }}
          >
            {renderInputField(blocks[0])}
          </div>
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "25%" }}
          >
            {renderInputField(blocks[1])}
          </div>
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "25%" }}
          >
            {renderInputField(blocks[2])}
          </div>
          <div
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: "25%" }}
          >
            {renderInputField(blocks[3])}
          </div>
        </div>
      );
    }

    //default fallback
    return (
      <div className="d-flex gap-2">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="border p-2 bg-white flex-grow-1 position-relative"
            style={{ width: `${100 / blocks.length}%` }}
          >
            {renderInputField(block)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Structure for columns */}
        <div className="col-md-2 p-2 text-center border-end">
          <div className="d-flex flex-column justify-content-between align-items-center p-2 ">
            {/* Dropdown  for selecting structure */}
            <button
              style={{
                cursor: "pointer",
                backgroundColor: "white",
                border: "1px solid #333",
              }}
              onClick={() => setShowStructures(!showStructures)}
              className="btn w-100 mb-3 mt-3"
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
                <li
                  className="p-3 border border-dark rounded mb-2 bg-white text-center fw-bold w-100"
                  draggable
                  onDragStart={(e) => handleDragStart(e, "2:1 column")}
                  style={{ cursor: "grab" }}
                >
                  2:1 Column Right
                </li>
                <li
                  className="p-3 border border-dark rounded mb-2 bg-white text-center fw-bold w-100"
                  draggable
                  onDragStart={(e) => handleDragStart(e, "2:2 column")}
                  style={{ cursor: "grab" }}
                >
                  2:2 Column
                </li>
                <li
                  className="p-3 border border-dark rounded mb-2 bg-white text-center fw-bold w-100"
                  draggable
                  onDragStart={(e) => handleDragStart(e, "3:3 column")}
                  style={{ cursor: "grab" }}
                >
                  3:3 Column
                </li>
                <li
                  className="p-3 border border-dark rounded mb-2 bg-white text-center fw-bold w-100"
                  draggable
                  onDragStart={(e) => handleDragStart(e, "4:4 column")}
                  style={{ cursor: "grab" }}
                >
                  4:4 Column
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
                className="editor-toolbar p-1 border d-flex justify-content-between align-items-center"
                style={{ backgroundColor: "lightgrey" }}
              >
                <div>
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
                <div>
                  <button className="btn border border-radius-50 bg-black text-white">
                  Save
                  </button>
                </div>
              </div>
            )}

            <div className="mb-3">
              <div
                className="border p-4 position-relative"
                style={{ minHeight: "300px" }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
              <EditorContent className=""  editor={editor}/>
                

                {/* Render direct container content */}
                {containerContent.map((item) => (
                  <div
                    key={item.id}
                    className="mb-2 p-2 border rounded position-relative"
                    style={{
                      backgroundColor:
                        item.type === "text"
                          ? "#f8f9fa"
                          : item.type === "image" ||
                            item.type === "image-placeholder"
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
                        {item.type === "image-placeholder" && (
                          <div className="d-flex align-items-center">
                            <FaImage className="me-2" /> {item.content}
                            <button
                              className="btn btn-sm btn-outline-primary ms-2"
                              onClick={() =>
                                handleImageUploadFunciton({
                                  isContainer: true,
                                  itemId: item.id,
                                })
                              }
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                        )}
                        {item.type === "link" && (
                          <div className="d-flex align-items-center">
                            <IoLinkOutline className="me-2" /> {item.content}
                          </div>
                        )}
                        {item.type === "text" && (
                          <div className="d-flex align-items-center">
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

                {/* Column layouts rendering */}
                {columns.map((column) => (
                  <div
                    key={column.id}
                    // className="mb-3 border p-2 position-relative"
                  >
                    {/* Column header with remove button */}
                   {/*  <div className="d-flex justify-content-between align-items-center mb-2 p-1 bg-light">
                      <span className="text-muted small">{column.type}</span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeColumn(column.id)}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div> */}

                    {/* Column content */}
                    {getColumnLayout(column.type, column.structure)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Modal */}
          {showCodeModal && (
            <div className="modal d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Insert Code</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowCodeModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <textarea
                      className="form-control"
                      rows="10"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="Paste your code here..."
                    ></textarea>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCodeModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveCode}
                    >
                      Insert
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Fields */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter description"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewTemplate;
