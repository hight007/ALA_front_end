import { useDropzone } from 'react-dropzone'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import React, { useState, useEffect, useRef, useCallback } from 'react'

export default function DropZone({ parentCallback }) {
    const dropzoneStyle = {
        width: "100%",
        height: "auto",
        minHeight: 100,
        borderWidth: 2,
        borderColor: "rgb(102, 102, 102)",
        borderStyle: "dashed",
        borderRadius: 5,
        textAlign: "center",
    }

    const thumbsContainer = {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16
    };

    const thumb = {
        display: 'inline-flex',
        borderRadius: 2,
        border: '1px solid #eaeaea',
        marginBottom: 8,
        marginRight: 8,
        width: 100,
        height: 100,
        padding: 4,
        boxSizing: 'border-box'
    };

    const thumbInner = {
        display: 'flex',
        minWidth: 0,
        overflow: 'hidden'
    };

    const img = {
        display: 'block',
        width: 'auto',
        height: '100%',
    };

    const [files, setFiles] = useState([]);

    const returnImgFile = () => {
        if (files.length > 0) {
            parentCallback(files);
        }
    }
    const { getRootProps, getInputProps } = useDropzone({
        accept: '.jpg',
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        },
        onDropAccepted: returnImgFile()
    });

    const thumbs = files.map(file => (

        <div style={thumb} key={file.name}>
            <div style={thumbInner}>
                <Zoom>
                    <img
                        src={file.preview}
                        style={img}
                    />
                </Zoom >
            </div>
        </div>

    ));

    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    return (
        <section className="container">
            <div {...getRootProps({ className: 'dropzone', style: dropzoneStyle })}>
                <input {...getInputProps()} />
                <p style={{ marginTop: 35 }}>Drag 'n' drop some files here, or click to select files</p>
            </div>
            <aside style={thumbsContainer}>
                {thumbs}
            </aside>
            <aside>
                {/* <button onClick={returnImgFile} className="btn btn-primary">Upload</button> */}
                {/* {returnImgFile()} */}
            </aside>
        </section>
    );
}
