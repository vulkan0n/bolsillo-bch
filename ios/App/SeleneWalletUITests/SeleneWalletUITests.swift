

//
//  SeleneWalletUITests.swift
//  SeleneWalletUITests
//
//  Created by Kallisti on 9/2/24.
//

import XCTest

final class SeleneWalletUITests: XCTestCase {

    @MainActor override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
        // UI tests must launch the application that they test.
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launch()

        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    @MainActor func testExample() throws {


        let webViewsQuery = XCUIApplication().webViews.webViews.webViews
        
        snapshot("01MainScreen")
        
        webViewsQuery/*@START_MENU_TOKEN@*/.otherElements["main"]/*[[".otherElements[\"Selene Wallet\"].otherElements[\"main\"]",".otherElements[\"main\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/.children(matching: .other).element(boundBy: 1).children(matching: .button).element.tap()
        
        webViewsQuery/*@START_MENU_TOKEN@*/.buttons["send"]/*[[".otherElements[\"Selene Wallet\"]",".otherElements[\"main\"].buttons[\"send\"]",".buttons[\"send\"]"],[[[-1,2],[-1,1],[-1,0,1]],[[-1,2],[-1,1]]],[0]]@END_MENU_TOKEN@*/.tap()
        
        snapshot("01SendScreen")

        let arrowLeftBackButton = webViewsQuery/*@START_MENU_TOKEN@*/.buttons["arrow-left Back"]/*[[".otherElements[\"Selene Wallet\"]",".otherElements[\"main\"].buttons[\"arrow-left Back\"]",".buttons[\"arrow-left Back\"]"],[[[-1,2],[-1,1],[-1,0,1]],[[-1,2],[-1,1]]],[0]]@END_MENU_TOKEN@*/
        arrowLeftBackButton.tap()
        
        webViewsQuery/*@START_MENU_TOKEN@*/.images["setting"]/*[[".otherElements[\"Selene Wallet\"]",".otherElements[\"main\"]",".links[\"setting Settings\"]",".links[\"setting\"].images[\"setting\"]",".images[\"setting\"]"],[[[-1,4],[-1,3],[-1,2,3],[-1,1,2],[-1,0,1]],[[-1,4],[-1,3],[-1,2,3],[-1,1,2]],[[-1,4],[-1,3],[-1,2,3]],[[-1,4],[-1,3]]],[0]]@END_MENU_TOKEN@*/.tap()
        snapshot("02SettingsScreen")

        // Use XCTAssert and related functions to verify your tests produce the correct results.
    }

    func testLaunchPerformance() throws {
        if #available(macOS 10.15, iOS 13.0, tvOS 13.0, watchOS 7.0, *) {
            // This measures how long it takes to launch your application.
            measure(metrics: [XCTApplicationLaunchMetric()]) {
                XCUIApplication().launch()
            }
        }
    }
}
