import React from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Head from "next/head";
import { Prisma, PrismaClient, Recycle, MapItem } from "@prisma/client";
import LeafletAddressLookup from "../components/findAddress";
import styles from '../styles/editPost.module.css'
import { DeepRecycle } from "@/types";
import { yearLimits } from ".";


export default function EditPost() {
  const [newData, setNewData] = useState([{}] as DeepRecycle[]);
  const [filterData, setFilterData] = useState({} as DeepRecycle);

  const [projectType, setProjectType] = useState("");
  const [description, setDescription] = useState("");
  const [searchingFor, setSearchingFor] = useState({});
  const [available, setAvailableMaterials] = useState({});
  const [startYear, setStartYear] = useState(yearLimits.min);
  const [startMonth, setStartMonth] = useState("");
  const [project, setProject] = useState("");
  const [organisation, setOrganisation] = useState("");

  const [lat, setLat] = useState();
  const [lon, setLon] = useState();

  const [locationToggle, setLocationToggle] = useState(false);

  const router = useRouter();

  // Fetches all data from the database
  const fetchData = async () => {
    const response = await fetch('http://localhost:3000/api/getData')
    const data = await response.json()
    setNewData(data)
  }

  // Runs fetchData function on component mount
  useEffect(() => {
    fetchData()
  }, [])

  // Fetches the data with a specific id from the database
  const fetchFilterData = async (id: any) => {
    const response = await fetch('http://localhost:3000/api/editData?id=' + id)
    const data: DeepRecycle = await response.json()
    console.log(data)
    setFilterData(data)
  }

  // Runs fetchData function when the project state changes
  useEffect(() => {
    fetchFilterData(project)
  }, [project])


  const NewPostMap = React.useMemo(() => dynamic(
    () => import('../components/newPostMap'),
    {
      loading: () => <p>A map is loading</p>,
      ssr: false
    }
  ), [/* list variables which should trigger a re-render here */])

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // Gets the keys of the searchingFor object and returns them as a string
    let lookingForMaterials: string = (() => {
      let materials: string[] = [];
      for (let key in searchingFor as any) {
        if (searchingFor![key as keyof (typeof searchingFor)]) {
          materials.push(key);
        }
      }
      return materials.join(", ");
    })();
    // Gets the keys of the offering object and returns them as a string
    let availableMaterials: string = (() => {
      let materials: string[] = [];
      for (let key in available as any) {
        if (available![key as keyof (typeof available)]) {
          materials.push(key);
        }
      }
      return materials.join(", ");
    })();
    const data = {
      projectType: projectType ? projectType : undefined,
      description: description ? description : undefined,
      lookingForMaterials: lookingForMaterials ? lookingForMaterials : null,
      availableMaterials: availableMaterials ? availableMaterials : null,
      month: startMonth ? parseInt(startMonth) : undefined,
      mapItem: {
        organisation: organisation ? organisation : undefined,
        year: startYear ? startYear : undefined,
        latitude: parseFloat(lon!) ? parseFloat(lon!) : undefined,
        longitude: parseFloat(lat!) ? parseFloat(lat!) : undefined,
      }

    }
    console.log(data)
    const response = await fetch(('http://localhost:3000/api/editData?id=' + project), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    console.log(result)
    router.push('/')
  }

  const getProject = () => {
    let mappedData = newData.map((pin: any) => pin.id)
    return (
      <>
        {mappedData.map((pin: any, index: any) => {
          return (
            <option key={pin} value={pin}>{pin}</option>
          )
        })}
      </>
    )
  }

  const projectTypes = () => {
    let categories = [
      "Rivning",
      "Nybyggnation",
      "Ombyggnation",
    ]
    return (
      <>
        {categories.map((category: any, index: any) => {
          return (
            <div className={styles.typeInputGroup} key={category}>
              <input
                type="radio"
                id={category}
                name="category"
                value={category}
                defaultChecked={filterData.projectType === category ? true : false}
                onChange={(e) => setProjectType(e.target.value)}

              />
              <label htmlFor={category}>{category} </label>
            </div>
          )
        }
        )}
      </>
    )
  }

  const offers = () => {
    let categories = [
      "Stomme",
      "Inredning",
      "Småsaker",
      "Övrigt",
    ]
    return (
      <>
        {categories.map((category: any, index: any) => {
          return (
            <div className={styles.inputGroup} key={"_" + category}>
              <input
                type="checkbox"
                id={"_" + category}
                name={category}
                value={category}
                defaultChecked={filterData.availableMaterials?.includes(category) ? true : false}
                onChange={(e) => setAvailableMaterials({
                  ...available,
                  [e.target.name]: e.target.checked
                })}
              />
              <label htmlFor={"_" + category}>{category}</label>
            </div>
          )
        })}
      </>
    )
  }

  const searchingFors = () => {
    let categories = [
      "Stomme",
      "Inredning",
      "Småsaker",
      "Övrigt",
    ]
    return (
      <>
        {categories.map((category: any, index: any) => {
          return (
            <div className={styles.inputGroup} key={category}>
              <input
                type="checkbox"
                id={category}
                name={category}
                value={category}
                defaultChecked={filterData.lookingForMaterials?.includes(category) ? true : false}
                onChange={(e) => setSearchingFor({
                  ...searchingFor,
                  [e.target.name]: e.target.checked
                })
                }
              />
              <label htmlFor={category}>{category}</label>
            </div>
          )
        })}
      </>
    )
  }


  return (
    <>
      <Head>
        <title>Återbrukskartan</title>
        <link rel="icon" type="image/x-icon" href="/stunsicon.ico" />
      </Head>
      <div className={styles.header} id={styles.header}>
        <img src="/images/stuns_logo.png" alt="logo" />
      </div>
      <div className={styles.addPostContainer}>
        <div className={styles.addNewPostContainer}>
          <h1 className={styles.addNewPostTitle}>Redigera ett inlägg</h1>
          <div className={styles.addNewPostForm}>
            <form method="put" onSubmit={handleSubmit}>
              <div className={styles.addNewPostFormOrganization}>
                <h3>Välj projekt</h3>
                <select
                  id="project"
                  name="project"
                  defaultValue={filterData?.id}
                  onChange={(e) => setProject(e.target.value)}
                >
                  <option value="">Välj projekt</option>
                  {getProject()}
                </select>
              </div>

              <div className={styles.addNewPostFormOrganization}>
                <h3>Organisation *</h3>

                {/* if you want to use the text input instead of the select, comment out the select and uncomment the text input
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                /> */}
                <select
                  id="organization"
                  name="organization"
                  onChange={(e) => setOrganisation(e.target.value)}
                >
                  <option defaultValue={filterData.mapItem?.organisation ? filterData.mapItem.organisation : undefined}>{filterData.mapItem?.organisation}</option>

                </select>
              </div>
              <div className={styles.startYear}>
                <h3>Startår</h3>
                <input
                  type="number"
                  id="startYear"
                  name="startYear"
                  defaultValue={filterData.mapItem?.year ? filterData.mapItem.year : undefined}
                  min={yearLimits.min}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                />
              </div>

              <div className={styles.startMonth}>
                <h3>Startmånad</h3>
                <select
                  id="startMonth"
                  name="startMonth"
                  defaultValue={filterData.month ? filterData.month : undefined}
                  onChange={(e) => setStartMonth(e.target.value)}
                >
                  <option value={""}>Välj startmånad</option>
                  <option value={1}>Januari</option>
                  <option value={2}>Februari</option>
                  <option value={3}>Mars</option>
                  <option value={4}>April</option>
                  <option value={5}>Maj</option>
                  <option value={6}>Juni</option>
                  <option value={7}>Juli</option>
                  <option value={8}>Augusti</option>
                  <option value={9}>September</option>
                  <option value={10}>Oktober</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </div>
              <div className={styles.optionList}>
                <div className={styles.form}>
                  <h3>Typ av projekt</h3>
                  {projectTypes()}
                </div>
              </div>

              <div className={styles.addNewPostFormLocation}>
                <h3>Plats *</h3>
                <div className={styles.switch}>
                  <input
                    id="switch-1"
                    type="checkbox"
                    className={styles.switchInput}
                    onChange={(e) => setLocationToggle(e.target.checked)}
                  />
                  {/* If you want to switch to map, uncomment this part*/}
                  <label htmlFor="switch-1" className={styles.switchLabel}>Switch</label>
                </div>
                {
                  locationToggle === true ?
                    <>
                      <NewPostMap
                        setLat={setLat}
                        setLon={setLon}
                        lat={lat}
                        lon={lon}
                      />
                    </>
                    :
                    <LeafletAddressLookup
                      setLat={setLat}
                      setLon={setLon}
                      lat={lat}
                      lon={lon}
                    />
                }
              </div>
              <div className={styles.optionList}>
                <div className={styles.form}>
                  <h3>Erbjuds</h3>
                  {offers()}
                </div>

                <div className={styles.form}>
                  <h3>Sökes</h3>
                  {searchingFors()}
                </div>
              </div>

              <div className={styles.addNewPostFormDescription}>
                <h3>Beskrivning *</h3>
                <textarea
                  id="description"
                  name="description"
                  rows={10}
                  maxLength={3000}
                  placeholder="Hur mycket (Ex. mått och vikt) och kort om skicket på produkten."
                  defaultValue={filterData.description ? filterData.description : undefined}
                  onChange={(e) => {
                    setDescription(e.target.value)
                  }}
                />
              </div >
              <div className={styles.addNewPostFormContact}>
                <h3>Kontakt *</h3>
                <textarea
                  id="contact"
                  name="contact"
                  rows={3}
                  cols={100}
                  defaultValue={filterData.contact ? filterData.contact : undefined}
                // onChange={(e) => setContact(e.target.value)}
                />
              </div >
              <div className={styles.addNewPostFormExternalLinks}>
                <h3>Länkar</h3>
                <textarea
                  id="externalLinks"
                  name="externalLinks"
                  rows={1}
                  cols={100}
                  defaultValue={filterData.externalLinks ? filterData.externalLinks : undefined}
                // onChange={(e) => setExternalLinks(e.target.value)}
                />
              </div >
              <div className={styles.addNewPostFormSubmit}>
                < button type="submit" > Spara</button >
              </div >
              {/* <div className={styles.message}>{message ? <p>{message}</p> : null}</div> */}
            </form >
          </div >
        </div >
      </div >
      <div className={styles.footer} id={styles.footer}>
        < div className={styles.footerContainer}>
          <div className={styles.footerRow}>
            <div className={styles.footerHeader}>STUNS</div>
            <div className={styles.footerLink}>
              <a href="https://stuns.se/" target="_blank" rel="noreferrer">
                STUNS
              </a>
            </div >
          </div >
        </div >
      </div >
    </>
  )
}