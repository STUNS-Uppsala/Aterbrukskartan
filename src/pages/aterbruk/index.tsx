import React from 'react'
import dynamic from 'next/dynamic'
import Sidebar from '@/components/aside/sidebar'
import MobileSidebar from '@/components/aside/mobileNavbar'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { RecycleFilter } from '@/types'
import Image from 'next/image'
import styles from '@/styles/index.module.css'
import { Tooltip } from '@nextui-org/react'
import { Badge } from '@nextui-org/react'
import { logoutFunction } from '@/components/logout'
import { getSession } from '@/session'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import Aside from '@/components/aside/aside'

// Get user data from session
export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const { user } = await getSession(req, res)

  if (!user) {
    return {
      props: {
        user: null
      }
    }
  }

  return {
    props: {
      user: user
    }
  }
}

/**
 * The minimum and maximum year that can be selected in the year slider in ../components/sidebar.tsx
 * These values are also used at other points to check if the sliders are at their default values
 */
export const yearLimitsRecycle = {
  min: new Date().getFullYear(),
  max: new Date().getFullYear() + 10,
}

// Array of all months in swedish.
export const monthArray = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];

/** The main page for the recycle section of the website. */
export default function HomePage({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()

  const [isMobile, setIsMobile] = useState(false as boolean)

  // Contains the currently active filters
  const [currentFilter, setFilter] = useState({} as RecycleFilter)

  // Content of the search bar
  const [searchInput, setSearchInput] = useState("")

  // State for configuring the max amount of items in a category that can be selected before the label is compacted
  const maxCategoryAmount = React.useMemo(() => 2, [])

  // Dynamically imports the map component
  // TODO: This will look a little laggy as the map component will render a loading spinner when fetching data aswell
  // TODO: See if you can maybe pass in the isLoading state as a prop here maybe?
  const Map = React.useMemo(() => dynamic(
    () => import('../../components/map'),
    {
      loading: () =>
        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', position: 'absolute', top: '0', left: '0', backgroundColor: 'rgba(255, 255, 255, .75)', borderRadius: '.5rem', zIndex: 99 }}>
          <Image src="/loading.svg" alt="Laddar data" width={128} height={128}></Image>
        </div>,
      ssr: false
    }
  ), [/* list variables which should trigger a re-render here */])

  /** Function for navigating to the new post page */
  // QUESTION: Why do we not use normal links here?
  const goToNewPost = () => {
    router.push("/aterbruk/newPost" + window.location.search)
    // useRouteHandler("/aterbruk/newPost")
  }

  /** Function for navigating to the edit post page */
  const goToEditPost = () => {
    router.push("/aterbruk/editPost" + window.location.search)
    // useRouteHandler("/aterbruk/editPost")
  }

  /**
   * Returns a Badge component from nextui with the currently active project type filters, if any
   * 
   * If the amount of selected categories is greater than maxCategoryAmount, the label will be compacted
   * to only display the amount of selected projecttypes
   */
  const projectTypeLabel = () => {
    if (currentFilter.projectType?.length) {
      if (currentFilter.projectType.length > maxCategoryAmount) {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "navy", color: "bone" }}>{currentFilter.projectType.length} projekttyper</Badge>
        )
      }
      else {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "navy", color: "bone" }}>{currentFilter.projectType.join(", ")}</Badge>
        )
      }
    }
  }

  /**
   * Returns a Badge component from nextui with the currently active year filters, if any
   * 
   * If the year slider is at its default value, the label will not be displayed
   * If the year slider is at a value where the min and max values are the same, the label will be compacted to only display the single year
   */
  const yearLabel = () => {
    if (currentFilter.years?.length) {
      if (Math.min(...currentFilter.years) === yearLimitsRecycle.min && Math.max(...currentFilter.years) === yearLimitsRecycle.max) {
        return null;
      }
      else if (currentFilter.years[0] === currentFilter.years[1] && currentFilter.years[0] !== undefined) {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "#fd9800", color: "bone" }}>År: {currentFilter.years[0]}</Badge>
        )
      }
      else {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "#fd9800", color: "bone" }}>År: {Math.min(...currentFilter.years)} - {Math.max(...currentFilter.years)}</Badge>
        )
      }
    }
  }

  /**
   * Returns a Badge component from nextui with the currently active month filters, if any
   * 
   * If the month slider is at its default value, the label will not be displayed
   * If the month slider is at a value where the min and max values are the same, the label will be compacted to only display the single month
   */
  const monthLabel = () => {
    if (currentFilter.months?.length) {
      if (Math.min(...currentFilter.months) === 1 && Math.max(...currentFilter.months) === 12) {
        return null;
      }
      else if (currentFilter.months[0] === currentFilter.months[1] && currentFilter.months[0] !== undefined) {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "violet", color: "bone" }}>Månad: {monthArray[currentFilter.months[0] - 1]}</Badge>
        )
      }
      else {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "violet", color: "bone" }}>Månader: {monthArray[Math.min(...currentFilter.months) - 1]} - {monthArray[Math.max(...currentFilter.months) - 1]}</Badge>
        )
      }
    }
  }


  /**
   * Returns a Badge component from nextui with the currently active filters regarding materials that are being searched for by the projects on the map, if any
   * 
   * If the amount of selected material categories is greater than maxCategoryAmount, the label will be compacted
   * to only display the amount of selected material categories
   */
  const lookingForMaterialsLabel = () => {
    if (currentFilter.lookingForCategories?.length) {
      if (currentFilter.lookingForCategories.length > maxCategoryAmount) {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "green", color: "bone" }}>Sökes: {currentFilter.lookingForCategories.length} kategorier</Badge>
        )
      }
      else {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "green", color: "bone" }}>Sökes: {currentFilter.lookingForCategories.join(", ")}</Badge>
        )
      }
    }
  }

  /**
   * Returns a Badge component from nextui with the currently active filters regarding available materials, if any
   * 
   * If the amount of selected material categories is greater than maxCategoryAmount, the label will be compacted
   * to only display the amount of selected material categories
   */
  const availableMaterialsLabel = () => {
    if (currentFilter.availableCategories?.length) {
      if (currentFilter.availableCategories.length > maxCategoryAmount) {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "crimson", color: "bone" }}>Erbjuds: {currentFilter.availableCategories.length} kategorier</Badge>
        )
      }
      else {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "crimson", color: "bone" }}>Erbjuds: {currentFilter.availableCategories.join(", ")}</Badge>
        )
      }
    }
  }

  /**
   * Returns a Badge component from nextui with the currently active filters regarding organisations, if any
   * 
   * If the amount of selected organisations is greater than maxCategoryAmount, the label will be compacted
   * to only display the amount of selected organisations
   */
  const organisationLabel = () => {
    if (currentFilter.organisation?.length) {
      if (currentFilter.organisation.length > maxCategoryAmount) {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "teal", color: "bone" }}>{currentFilter.organisation.length} Organisationer</Badge>
        )
      }
      else {
        return (
          <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "teal", color: "bone" }}>Organisationer: {currentFilter.organisation.join(", ")}</Badge>
        )
      }
    }
  }

  /**
   * Returns a Badge component from nextui with the currently active filters regarding showing inactive projects, if any
   * 
   * If the showInactive filter is true, the label will be displayed
   */
  const showInactiveLabel = () => {
    if (currentFilter.showInactive) {
      return (
        <Badge disableOutline enableShadow size="lg" className={styles.filterText} style={{ backgroundColor: "black", color: "bone" }}>Visar inaktiva objekt</Badge>
      )
    }
  }

  /** Checks if the user is on a mobile device and sets the state accordingly */
  const checkMobile = (setIsMobile: any) => {
    if (window.matchMedia("(orientation: portrait)").matches || window.innerWidth < 1000) {
      return setIsMobile(true);
    }
    else {
      return setIsMobile(false);
    }
  }

  // Checks if the user is on a mobile device on first render
  useEffect(() => {
    checkMobile(setIsMobile);
  }, [])

  // Adds an event listener to check if the window is resized to a size where the interface should change
  useEffect(() => {
    window.addEventListener("resize", () => checkMobile(setIsMobile));
    return () => window.removeEventListener("resize", () => checkMobile(setIsMobile));
  }, [])

  return (
    <>
      <Head>
        <title>Återbrukskartan</title>
        <link rel="icon" type="image/x-icon" href="/stunsicon.ico" />
      </Head>

      <main className='grid gap-50 padding-50' style={{ backgroundColor: '#f5f5f5', gridTemplateRows: 'calc(100dvh - 1rem)', gridTemplateColumns: 'auto auto 1fr' }}>
        <aside className='padding-50 flex justify-content-space-between' style={{ backgroundColor: 'white', borderRadius: '.5rem', flexDirection: 'column' }}>

          <section>
            <Image src='/back.svg' alt='Stäng menu' width={32} height={32} />
            {/* Login button  */}
            {!user && (
              <label className='flex align-items-center justify-content-flex-end gap-100'>
                <button type="button" className={styles.linkButton} onClick={() => router.push('/login' + window.location.search)}>
                  <Image src="./images/adminIcons/login.svg" alt='Logga in' width={32} height={32} />
                </button>
                Logga in
              </label>
            )}
          </section>

          <section>
            {/* Buttons leading to other pages where one can add/edit projects to the database */}
            {(user?.isAdmin || user?.isRecycler) && (
              <>
                <label className='flex align-items-center gap-100'>
                  <button type="button" className={styles.linkButton} onClick={goToEditPost}>
                    <Image src="./images/adminIcons/edit.svg" alt='Redigera projekt' width={32} height={32} />
                  </button>
                  Redigera inlägg
                </label>

                <label className='flex align-items-center gap-100'>
                  <button type="button" className={styles.linkButton} onClick={goToNewPost}>
                    <Image src="./images/adminIcons/addToMap.svg" alt='Lägg till nytt projekt' width={32} height={32} />
                  </button>
                  Lägg till nytt inlägg
                </label>
              </>
            )}

            {/* Buttons leading to the admin pages */}
            {user?.isAdmin && (
              <>
                <label className='flex align-items-center gap-100'>
                  <button type="button" className={styles.linkButton} onClick={() => router.push('admin/editUser' + window.location.search)}>
                    <Image src="./images/adminIcons/editUser.svg" alt='Redigera användare' width={32} height={32} />
                  </button>
                  Redigera användare
                </label>

                <label className='flex align-items-center gap-100'>
                  <button type="button" className={styles.linkButton} onClick={() => router.push('admin/addUser' + window.location.search)}>
                    <Image src="./images/adminIcons/addUser.svg" alt='Lägg till ny användare' width={32} height={32} />
                  </button>
                  Lägg till ny användare
                </label>
              </>
            )}
          </section>

          <section>
            {/* Logout button */}
            {user && (
              <label className='flex align-items-center gap-100'>
                <button type="button" className={styles.linkButton} onClick={logoutFunction}>
                  <Image src="./images/adminIcons/logout.svg" alt='Logga ut' width={32} height={32} />
                </button>
                Logga ut
              </label>
            )}
          </section>

        </aside>

        <aside className='padding--block-50' style={{ width: '400px', backgroundColor: 'white', borderRadius: '.5rem', paddingTop: '0' }}>
          <label className='block padding-50'>
            <div className='flex gap-100 flex-wrap-wrap justify-content-space-between align-items-center'>
              <span>Sök bland projekt</span>
              <span>?</span>
            </div>
            {!isMobile ?
              <input
                type="search"
                className='margin-block-25'
                placeholder="Sök efter projekt..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              : null}
          </label>

          <div className='padding-right-50 padding-block-50' style={{ height: 'calc(100% - 78px)' }}>
            <div className='padding-inline-50' style={{ borderRadius: '.5rem', maxHeight: '100%', overflowY: 'scroll' }}>
              {!isMobile ? <Sidebar monthArray={monthArray} maxCategoryAmount={maxCategoryAmount} currentFilter={currentFilter} setFilter={setFilter} currentMap="Recycle" user={user} /> : <MobileSidebar setFilter={setFilter} currentMap="Recycle" user={user} />}
            </div>
          </div>
        </aside>

        <div style={{ position: 'relative' }}>
          <Map currentFilter={currentFilter} searchInput={searchInput} currentMap="Recycle" />
        </div>

      </main>
    </>
  )
}