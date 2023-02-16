import React from "react";
import { useRouter } from "next/router";

export default function addNewPost() {
    const router = useRouter();

    const goToMap = () => {
        router.push("/");
    };

    return (
        <>
            <div className="header" id="header">
                <img src="/images/stuns_logo.png" alt="logo" />
            </div>
            <div className="addPostContainer">
                <div className="addNewPostContainer">
                    <div className="addNewPostTitle">
                        <h1>Lägg till ett inlägg</h1>
                    </div>
                    <div className="addNewPostForm">
                        <form>
                            <div className="addNewPostFormName">
                                <label htmlFor="title">* Namn</label>
                                <input type="text" id="title" name="title" />
                            </div>
                            <div className="addNewPostFormOrganization">
                                <label htmlFor="title">* Organisation</label>
                                <input type="text" id="title" name="title" />
                            </div>
                            <div className="addNewPostFormDescription">
                                <label htmlFor="description">* Beskrivning</label>
                                <textarea id="description" name="description" rows={20} cols={100} />
                            </div>
                            <div className="addNewPostFormImage">
                                <label htmlFor="image">Bild</label>
                                <input type="file" id="image" name="image" />
                            </div>
                            <div className="addNewPostFormLocation">
                                <label htmlFor="location">* Plats</label>
                                <input type="text" id="location" name="location" placeholder="Skriv dina koordinater" />
                            </div>
                            <div className="addNewPostFormSubmit">
                                <button type="submit" onClick={goToMap}>Spara</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}