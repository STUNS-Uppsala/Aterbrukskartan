import { Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import * as pinIcons from '../components/icons'
import React from 'react'
import Image from 'next/image'
import * as popup from "../components/popupStyles";
import { DeepStory, StoryFilter } from '@/types'
import { runActiveFilters } from '@/functions/filters/storyFilters'
import { Collapse } from '@nextui-org/react'

/**
 * 
 * @param pin Check if the pin is in the current filter
 * @returns Generates relevant popup for the pin
 */
export function storiesPopup(pin: any) {
  return (
    <Popup className='request-popup'>
      <div>

        {/* Name of the project to be displayed as header */}
        <div style={popup.PopupHead}>
          {pin.mapItem.name}
        </div>

        {/* Popup contents */}
        <div style={popup.PopupText}>
          {/* If the pin has extra info, display it */}
          {!pin.mapItem.year ? null : <span>{pin.mapItem.year}<br /></span>}
          {!pin.mapItem.address ? null : <span>{pin.mapItem.address}<br /></span>}
          {!pin.mapItem.organisation ? null : <span>{pin.mapItem.organisation}<br /></span>}

          {/* If the pin has a descpirtion, make a divider and a collapse menu to display it in */}
          {!pin.descriptionSwedish ? null :
            <div style={popup.Divider}>
              <div style={popup.DividerLineDesc}></div>
              <Image width={25} height={25} src="/images/dividers/description.svg" alt="Delare" />
              <div style={popup.DividerLineDesc}></div>
            </div>}
          {!pin.descriptionSwedish ? null : <Collapse title="Sammanfattning" subtitle="Tryck för att visa / gömma sammanfattning" divider={false}><div style={popup.PopupDesc}><p>{pin.descriptionSwedish}</p></div></Collapse>}
          
          {/* If the pin has a video link, make a divider and an iframe to display it in */}
          {!pin.videos ? null :
            <div style={popup.Divider}>
              <div style={popup.DividerLineVideo}></div>
              <Image width={25} height={25} src="/images/dividers/video.svg" alt="Delare" />
              <div style={popup.DividerLineVideo}></div>
            </div>
          }
          {!pin.videos ? null : <iframe style={{ borderRadius: "10px" }} width="100%" height="auto" src={pin.videos} allowFullScreen />}

          {/* If there is a PDF case link but no report link, make a green divider */}
          {!pin.pdfCase || pin.pdfCase && pin.reports ? null :
            <div style={popup.Divider}>
              <div style={popup.DividerLineCase}></div>
              <Image width={25} height={25} src="/images/dividers/infogreen.svg" alt="Delare" />
              <div style={popup.DividerLineCase}></div>
            </div>
          }

          {/* If there is an open data link but no PDF case nor report link, make a red divider */}
          {!pin.openData || pin.openData && pin.reports || pin.openData && pin.pdfCase || pin.openData && pin.reports ? null :
            <div style={popup.Divider}>
              <div style={popup.DividerLineOpen}></div>
              <Image width={25} height={25} src="/images/dividers/infored.svg" alt="Delare" />
              <div style={popup.DividerLineOpen}></div>
            </div>
          }

          {/* If there is a report link, make a purple divider */}
          {!pin.reports ? null :
            <div style={popup.Divider}>
              <div style={popup.DividerLineReport}></div>
              <Image width={25} height={25} src="/images/dividers/infopurple.svg" alt="Delare" />
              <div style={popup.DividerLineReport}></div>
            </div>
          }

          {/* If there is a report link, PDF case link or open data link, make a button of corresponding color with said link */}
          <div style={popup.flexRow}>
            {!pin.reports ? null :
              <div style={popup.AlignLinks}>
                <a href={pin.reports} target="_blank" rel="noreferrer">
                  <span style={popup.PopupLinkReport}>
                    <Image width={30} height={30} src="/images/categories/newspaper.svg" alt="Rapport" />
                  </span>
                </a>
                Rapport
              </div>}
            {!pin.pdfCase ? null :
              <div style={popup.AlignLinks}>
                <a href={pin.pdfCase} target="_blank" rel="noreferrer">
                  <span style={popup.PopupLinkPdf}>
                    <Image width={30} height={30} src="/images/categories/case.svg" alt="Case" />
                  </span>
                </a>
                Case
              </div>}
            {!pin.openData ? null :
              <div style={popup.AlignLinks}>
                <a href={pin.openData} target="_blank" rel="noreferrer">
                  <span style={popup.PopupLinkOpenData}>
                    <Image width={30} height={30} src="/images/categories/dataicon.svg" alt="Öppna data" />
                  </span>
                </a>
                Öppna data
              </div>}
          </div>
        </div>
      </div>
    </Popup>
  )
}

// Arrays of all different color pins and categories in matching order. Used to color pins based on category
const iconArray = [pinIcons.IconPinPurple, pinIcons.IconPinTeal, pinIcons.IconPinViolet, pinIcons.IconPinAzure, pinIcons.IconPinGreenBlue, pinIcons.IconPinPink, pinIcons.IconPinYellowGreen, pinIcons.IconPinYellow, pinIcons.IconPinGreen, pinIcons.IconPinOrange, pinIcons.IconPinRed, pinIcons.IconPinBlue];
const categoryArray = ["Bygg och anläggning", "Grön energi", "Social hållbarhet", "Mobilitet", "Elnät", "Bioteknik", "Miljöteknik", "Energilagring", "Agrara näringar", "Livsmedel", "Hälsa", "Vatten och avlopp"]

/**
 * Function that returns the correct icon for a pin based on the category of the pin
 * 
 * If the pin has multiple categories, it will return the icon for its first category
 * 
 * If the pin has no category, it will return the default white pin
 * @param pinIndex Used to keep track of which shared index the pin is in the iconArray and categoryArray
 * @param mapData Contains all the data for the pins
 * @param currentFilter Used to check if the pin has a category that matches with the first category in the filter
 * @returns Matching color icon for the pin's category or the default white pin
 */
function getIcon(pinIndex: number, mapData: DeepStory[], currentFilter: StoryFilter) {
  // TODO Make it so pins are colored based on the first category in the filter *that matches with the pin*
  // Changes color of all displayed pins to match with the first category in the current filter, if any
  for (let i in categoryArray) {
    if (currentFilter.categories && currentFilter.categories[0]?.toLowerCase().includes(categoryArray[i].toLowerCase())) {
      return iconArray[i]
    }
  }
  // Loop through all categories in the pin and return the first matching category
  for (let i in categoryArray) {
    if (mapData[pinIndex].categorySwedish?.toLowerCase().includes(categoryArray[i].toLowerCase())) {
      return iconArray[i]
    }
  }
  // If the pin has no matching category, return the default white pin
  return pinIcons.IconPinWhite
}

/**
 * Function that returns all the pins that should be displayed on the map
 * @param mapData Contains all the data for the pins
 * @param currentFilter Used to check if the pin should be displayed based on the current filter
 * @returns All pins that should be displayed on the map
 */ 
export function storiesPins(mapData: DeepStory[], currentFilter: StoryFilter, searchInput: string | undefined) {
  if (searchInput) {
    currentFilter = { ...currentFilter, searchInput: searchInput }
  }
  let filteredData = runActiveFilters(mapData, currentFilter)

  return filteredData.map((pin: DeepStory, pinIndex: number) => {
    if (!pin.mapItem.latitude || !pin.mapItem.longitude) {
      return null
    } else {
      return (
        <Marker key={pin.id} position={[pin.mapItem.latitude!, pin.mapItem.longitude!]} icon={getIcon(pinIndex, filteredData, currentFilter)}>
          {pin ? storiesPopup(pin) : null}
        </Marker>
      )
    }
  })
}